import { useState } from "react";
import Spinner from "@/components/global/Spinner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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

interface Props {
	column?: Column;
	task?: Task & { tags: Tag[] };
	create?: (data: z.infer<typeof TaskFormSchema>, columnId: string) => Promise<void>;
	update?: (data: z.infer<typeof TaskFormSchema>, id: string) => Promise<void>;
}

const TaskForm = ({ column, task, create, update }: Props) => {
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
					{/* <h3>Add tags</h3>
					<TagCreator defaultTags={task?.tags || []} />
					<div className="flex flex-wrap items-center gap-2">
						{task &&
							task.tags.map((tag) => (
								<TagComponent key={tag.id} title={tag.name} color={tag.color} />
							))}
					</div> */}
					{/* <FormLabel>Assigned To Team Member</FormLabel>
            <Select
              onValueChange={setAssignedTo}
              defaultValue={assignedTo}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        Not Assigned
                      </span>
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allTeamMembers.map((teamMember) => (
                  <SelectItem
                    key={teamMember.id}
                    value={teamMember.id}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          alt="contact"
                          src={teamMember.avatarUrl}
                        />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        {teamMember.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
					<div className="grid grid-cols-12 gap-3">
						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => (
								<FormItem className="col-span-6 flex flex-col">
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
									<FormItem className="col-span-6 flex flex-col">
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
				<DialogFooter className="mt-4 sm:justify-start">
					<Button disabled={isLoading} type="submit">
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
					<Button variant="outline">Cancel</Button>
				</DialogFooter>
			</form>
		</Form>
	);
};

export default TaskForm;