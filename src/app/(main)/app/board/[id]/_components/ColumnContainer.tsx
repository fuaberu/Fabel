"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import { Column, Tag, Task } from "@prisma/client";
import { Edit, MoreVertical, PlusCircleIcon, Trash } from "lucide-react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnFormSchema } from "@/schemas/board";
import { z } from "zod";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/global/Spinner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
	column: Column;
	deleteColumn: (id: string) => Promise<void>;
	createTask: (columnId: string) => void;
	updateTask: (id: string, data: z.infer<typeof ColumnFormSchema>) => Promise<void>;
	deleteTask: (id: string) => Promise<void>;
	updateColumn: (id: string, data: z.infer<typeof ColumnFormSchema>) => Promise<void>;
	setUnsavedChanges: Dispatch<SetStateAction<boolean>>;
	tasks: (Task & { tags: Tag[] })[];
}

function ColumnContainer({
	column,
	deleteColumn,
	createTask,
	updateTask,
	tasks,
	deleteTask,
	updateColumn,
	setUnsavedChanges,
}: Props) {
	const tasksIds = useMemo(() => {
		return tasks.map((task) => task.id);
	}, [tasks]);

	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: column.id,
		data: {
			type: "Column",
			column,
		},
	});

	const [isEditOpen, setIsEditOpen] = useState(false);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const form = useForm<z.infer<typeof ColumnFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(ColumnFormSchema),
		defaultValues: {
			name: column.name || "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof ColumnFormSchema>) => {
		await updateColumn(column.id, values);
		setIsEditOpen(false);
		form.reset();
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		await deleteColumn(column.id);
		setIsDeleting(false);
		setIsDeleteOpen(false);
	};

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="flex	h-full max-h-full min-h-full w-[350px] min-w-[350px] flex-col rounded-md	border-2 border-primary opacity-40 shadow"
			></div>
		);
	}

	return (
		<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<div
					style={style}
					ref={setNodeRef}
					className="flex h-full max-h-full min-h-full w-[350px] min-w-[350px] flex-col rounded-md shadow"
				>
					<DropdownMenu>
						<div className="relative h-full rounded-lg bg-slate-300/30 pt-16 dark:bg-background/40">
							<div
								{...attributes}
								{...listeners}
								className=" absolute left-0 right-0 top-0 z-10 h-14 bg-slate-300/60 backdrop-blur-lg dark:bg-background/60 "
							>
								<div className="flex h-full cursor-grab items-center justify-between border-b-[1px] p-4 ">
									{/* {laneDetails.order} */}
									<div className="flex w-full items-center gap-2">
										<div className={cn("h-4 w-4 rounded-full bg-green-300")} />
										<span className="text-sm font-bold">{column.name}</span>
									</div>
									<div className="flex flex-row items-center">
										<DropdownMenuTrigger>
											<MoreVertical className="cursor-pointer text-muted-foreground" />
										</DropdownMenuTrigger>
									</div>
								</div>
							</div>
							<div className="flex h-full flex-grow flex-col gap-2 overflow-y-auto overflow-x-hidden p-2">
								<SortableContext
									items={tasksIds}
									id={column.id}
									strategy={verticalListSortingStrategy}
								>
									{tasks.map((task) => (
										<TaskCard
											key={task.id}
											task={task}
											deleteTask={deleteTask}
											setUnsavedChanges={setUnsavedChanges}
											updateTask={updateTask}
										/>
									))}
								</SortableContext>
							</div>
							<DropdownMenuContent>
								<DropdownMenuLabel>Options</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<AlertDialogTrigger id="delete" asChild>
									<DropdownMenuItem className="flex items-center gap-2">
										<Trash size={15} />
										Delete
									</DropdownMenuItem>
								</AlertDialogTrigger>

								<DialogTrigger id="edit" asChild>
									<DropdownMenuItem className="flex items-center gap-2">
										<Edit size={15} />
										Edit
									</DropdownMenuItem>
								</DialogTrigger>
								<DropdownMenuItem
									className="flex items-center gap-2"
									onClick={() => createTask(column.id)}
								>
									<PlusCircleIcon size={15} />
									Create Ticket
								</DropdownMenuItem>
							</DropdownMenuContent>
						</div>
					</DropdownMenu>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your account and remove
								your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter className="flex items-center">
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<Button className="bg-destructive" onClick={handleDelete}>
								{isDeleting ? (
									<div className="flex items-center gap-2">
										<Spinner size="sm" /> Deleting
									</div>
								) : (
									"Delete"
								)}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>

					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Edit Column</DialogTitle>
						</DialogHeader>
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
								</div>
								<DialogFooter className="sm:justify-start">
									<Button className="mt-4" disabled={isLoading} type="submit">
										{form.formState.isSubmitting ? (
											<div className="flex items-center gap-2">
												<Spinner size="sm" /> Saving
											</div>
										) : (
											"Save"
										)}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</div>
			</Dialog>
		</AlertDialog>
	);
}

export default ColumnContainer;