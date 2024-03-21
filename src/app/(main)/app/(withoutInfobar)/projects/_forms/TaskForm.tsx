import { Dispatch, SetStateAction, useState } from "react";
import Spinner from "@/components/global/Spinner";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useModal } from "@/providers/ModalProvider";
import { TaskFormSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, Tag, Task } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import TagComponent from "../_components/board/TagComponent";
import TagManager from "../_components/board/TagManager";
import { BoardApp } from "../_components/ClientPage";

interface Props {
	column?: Column;
	task?: Task & { tags: Pick<Tag, "id" | "name" | "color">[] };
	defaultTags: Pick<Tag, "id" | "name" | "color">[];
	create?: (data: z.infer<typeof TaskFormSchema>, columnId: string) => Promise<void>;
	update?: (data: z.infer<typeof TaskFormSchema>, id: string) => Promise<void>;
	setBoard: Dispatch<SetStateAction<BoardApp>>;
}

const TaskForm = ({ column, task, defaultTags, create, update, setBoard }: Props) => {
	const { setModalClose } = useModal();

	const form = useForm<z.infer<typeof TaskFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(TaskFormSchema),
		defaultValues: {
			name: task?.name || "",
			description: task?.description || "",
			dueDate: task?.dueDate
				? new Date(
						task?.dueDate?.getFullYear(),
						task?.dueDate?.getMonth(),
						task?.dueDate?.getDate(),
					)
				: null,
			completedDate: task?.completedDate
				? new Date(
						task?.completedDate?.getFullYear(),
						task?.completedDate?.getMonth(),
						task?.completedDate?.getDate(),
					)
				: null,
		},
	});

	const isLoading = form.formState.isLoading;

	const [dueHours, setDueHours] = useState(task?.dueDate ? format(task.dueDate, "HH:mm") : "23:59");
	const [completedHours, setCompletedHours] = useState(
		task?.completedDate ? format(task.completedDate, "HH:mm") : format(new Date(), "HH:mm"),
	);

	const onSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
		if (column?.taskStatus === "DONE" && !values.completedDate) {
			return toast.error("Tasks in DONE columns must have a completed date");
		}

		let date = values.dueDate;
		if (date && dueHours) {
			const [hours, minutes] = dueHours.split(":").map((n) => parseInt(n));
			date.setHours(hours);
			date.setMinutes(minutes);
		}

		let completedDate = values.completedDate;
		if (completedDate && completedHours) {
			const [hours, minutes] = completedHours.split(":").map((n) => parseInt(n));
			completedDate.setHours(hours);
			completedDate.setMinutes(minutes);
		}

		if (task && update) {
			//	update
			await update(values, task.id);
		} else if (column && create) {
			//	create
			await create(values, column.id);
		}

		setModalClose();
	};

	const [dueDateTimeOpen, setDueDateTimeOpen] = useState(false);
	const [completedDateTimeOpen, setCompletedDateTimeOpen] = useState(false);

	// Tags
	const [projectTagsLocal, setProjectTagsLocal] = useState(defaultTags);
	const [taskTags, setTaskTags] = useState(
		task?.tags.sort((a, b) => a.id.localeCompare(b.id)) || [],
	);

	const onTagCreate = (data: Pick<Tag, "id" | "name" | "color">) => {
		setProjectTagsLocal((prev) => [...prev, data]);
		setBoard((prev) => ({
			...prev,
			tags: [...prev.tags, data],
		}));
	};

	const onTagEdit = (data: Pick<Tag, "id" | "name" | "color">) => {
		setProjectTagsLocal((prev) => prev.map((tag) => (tag.id === data.id ? data : tag)));
		setBoard((prev) => ({
			...prev,
			tags: prev.tags.map((tag) => (tag.id === data.id ? data : tag)),
		}));

		// If is already selected update state in task
		setTaskTags((prev) => prev.map((tag) => (tag.id === data.id ? data : tag)));
	};

	const onTagSelect = (data: Pick<Tag, "id" | "name" | "color">, checked: boolean) => {
		if (checked) {
			setTaskTags((prev) => [...prev, data].sort((a, b) => a.id.localeCompare(b.id)));
		} else {
			setTaskTags((prev) => prev.filter((tag) => tag.id !== data.id));
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-4">
					<FormField
						disabled={isLoading}
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						disabled={isLoading}
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										rows={8}
										placeholder="Description"
										className="styled-scrollbar"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<h3>Tags</h3>
					<div className="flex flex-wrap items-center gap-2">
						{column && (
							<TagManager
								onCreate={onTagCreate}
								onEdit={onTagEdit}
								onSelect={onTagSelect}
								projectTags={projectTagsLocal}
								projectId={column.boardId}
								tags={taskTags}
							/>
						)}
						{taskTags.length > 0 ? (
							taskTags.map((tag) => (
								<TagComponent key={tag.id} title={tag.name} color={tag.color} />
							))
						) : (
							<TagComponent title="No tags" color={"GRAY"} />
						)}
					</div>
					<div className="grid grid-cols-12 gap-3">
						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => (
								<FormItem className="col-span-12 flex flex-col sm:col-span-6">
									<FormLabel>Due Date</FormLabel>
									<Popover open={dueDateTimeOpen} onOpenChange={setDueDateTimeOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"pl-3 text-left font-normal",
														!field.value && "text-muted-foreground",
													)}
												>
													{(() => {
														const date = structuredClone(field.value);
														if (!date) return "Pick a date";
														if (dueHours) {
															const [hours, minutes] = dueHours.split(":").map((n) => parseInt(n));
															date.setHours(hours);
															date.setMinutes(minutes);
															return format(date, "PPPp");
														}

														return format(date, "PPP");
													})()}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="flex w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value as Date}
												onSelect={field.onChange}
												initialFocus
											/>
											<div className="flex flex-1 flex-col p-4">
												<FormItem>
													<FormLabel>Time</FormLabel>
													<FormControl>
														<Input
															type="time"
															value={dueHours}
															onChange={(e) => setDueHours(e.target.value)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
												<div className="mt-auto flex flex-col gap-1">
													<Button
														variant="destructive"
														onClick={() => {
															setDueHours("");
															form.setValue("dueDate", null);
														}}
													>
														Clear
													</Button>
													<Button onClick={() => setDueDateTimeOpen(false)}>OK</Button>
												</div>
											</div>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						{column?.taskStatus === "DONE" && (
							<FormField
								control={form.control}
								name="completedDate"
								render={({ field }) => (
									<FormItem className="col-span-12 flex flex-col sm:col-span-6">
										<FormLabel>Completed Date</FormLabel>
										<Popover open={completedDateTimeOpen} onOpenChange={setCompletedDateTimeOpen}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"pl-3 text-left font-normal",
															!field.value && "text-muted-foreground",
														)}
													>
														{(() => {
															const date = structuredClone(field.value);
															if (!date) return "Pick a date";
															if (completedHours) {
																const [hours, minutes] = completedHours
																	.split(":")
																	.map((n) => parseInt(n));
																date.setHours(hours);
																date.setMinutes(minutes);
																return format(date, "PPPp");
															}

															return format(date, "PPP");
														})()}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="flex w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value as Date}
													onSelect={field.onChange}
													initialFocus
												/>
												<div className="flex flex-1 flex-col p-4">
													<FormItem>
														<FormLabel>Time</FormLabel>
														<FormControl>
															<Input
																type="time"
																value={completedHours}
																onChange={(e) => setCompletedHours(e.target.value)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
													<div className="mt-auto flex flex-col gap-1">
														<Button
															variant="destructive"
															onClick={() => {
																setCompletedHours("");
																form.setValue("completedDate", null);
															}}
														>
															Clear
														</Button>
														<Button onClick={() => setCompletedDateTimeOpen(false)}>OK</Button>
													</div>
												</div>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</div>
				</div>
				<div className="mt-4 flex gap-3 sm:justify-start">
					<Button disabled={isLoading} type="submit" className="w-full sm:w-auto">
						{form.formState.isSubmitting ? (
							<div className="flex items-center gap-2">
								<Spinner size="sm" type="secondary" /> {task ? "Updating..." : "Creating..."}
							</div>
						) : task ? (
							"Update"
						) : (
							"Create"
						)}
					</Button>
					<Button
						type="button"
						onClick={setModalClose}
						variant="outline"
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default TaskForm;
