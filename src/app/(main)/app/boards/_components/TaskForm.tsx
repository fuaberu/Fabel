import Spinner from "@/components/global/Spinner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
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
import { Task } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Matcher } from "react-day-picker";
import { useState } from "react";

interface Props {
	columnId?: string;
	task?: Task;
	create?: (data: z.infer<typeof TaskFormSchema>, columnId: string) => Promise<void>;
	update?: (data: z.infer<typeof TaskFormSchema>, id: string) => Promise<void>;
}

const TaskForm = ({ columnId, task, create, update }: Props) => {
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
		},
	});

	const isLoading = form.formState.isLoading;

	const [dueHours, setDueHours] = useState(task?.dueDate ? format(task.dueDate, "HH:mm") : "");

	console.log(task?.dueDate, dueHours);

	const onSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
		let date = values.dueDate;
		if (date && dueHours) {
			const [hours, minutes] = dueHours.split(":").map((n) => parseInt(n));
			date.setHours(hours);
			date.setMinutes(minutes);
		}

		if (task && update) {
			//	update
			await update(values, task.id);
		} else if (columnId && create) {
			//	create
			await create(values, columnId);
		}

		setModalClose();
	};

	const [timeOpen, setTimeOpen] = useState(false);

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
									<Textarea placeholder="Description" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="dueDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Due Date</FormLabel>
								<Popover open={timeOpen} onOpenChange={setTimeOpen}>
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
													}

													return format(date, "PPPp");
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
												<Button onClick={() => setTimeOpen(false)}>OK</Button>
											</div>
										</div>
									</PopoverContent>
								</Popover>
								<FormDescription>Your date of birth is used to calculate your age.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<DialogFooter className="sm:justify-start">
					<Button className="mt-4" disabled={isLoading} type="submit">
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
				</DialogFooter>
			</form>
		</Form>
	);
};

export default TaskForm;
