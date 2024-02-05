"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tag, Task } from "@prisma/client";
import {
	AlertDialog,
	AlertDialogAction,
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MoreHorizontalIcon, Trash } from "lucide-react";
import TagComponent from "./TagComponent";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { updateTaskDb, updateTaskPositionDb } from "../actions";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { TaskFormSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/global/Spinner";

interface Props {
	task: Task & { tags: Tag[] };
	deleteTask: (id: string) => Promise<void>;
	updateTask: (id: string, data: z.infer<typeof TaskFormSchema>) => Promise<void>;
	setUnsavedChanges: Dispatch<SetStateAction<boolean>>;
}

function TaskCard({ task, deleteTask, setUnsavedChanges, updateTask }: Props) {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
		activeIndex,
		active,
		isOver,
		isSorting,
		newIndex,
		data,
	} = useSortable({
		id: task.id,
		data: {
			type: "Task",
			task,
		},
	});
	const [prevIndex, setPrevIndex] = useState(activeIndex);

	const router = useRouter();
	const pathname = usePathname();

	const [isEditOpen, setIsEditOpen] = useState(false);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const form = useForm<z.infer<typeof TaskFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(TaskFormSchema),
		defaultValues: {
			name: task.name || "",
			description: task.description || "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
		await updateTask(task.id, values);
		setIsEditOpen(false);
		form.reset();
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		await deleteTask(task.id);
		setIsDeleting(false);
		setIsDeleteOpen(false);
	};

	useEffect(() => {
		async function updatePos() {
			if (activeIndex !== prevIndex && !isDragging && !isOver && !active && !isSorting) {
				setUnsavedChanges(true);

				try {
					await updateTaskPositionDb(
						{
							id: task.id,
							columnId: data.sortable.containerId as string,
							order: newIndex,
						},
						pathname,
					);
				} catch (error) {
					toast.error("Error updating task position");
				}
				setUnsavedChanges(false);
			}
		}

		updatePos();

		if (activeIndex !== prevIndex) setPrevIndex(activeIndex);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeIndex]);

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="relative flex h-40 max-h-40 min-h-40 cursor-grab items-center rounded-md border-2 border-primary text-left"
			/>
		);
	}

	return (
		<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<div
					ref={setNodeRef}
					style={style}
					{...attributes}
					{...listeners}
					className="relative flex h-40 max-h-40 min-h-40 cursor-grab items-center overflow-hidden rounded-md text-left"
				>
					<DropdownMenu>
						<Card className="h-full w-full bg-white/50 shadow-none transition-all hover:ring-2 hover:ring-inset hover:ring-primary dark:bg-slate-900/50">
							<CardHeader className="p-[12px]">
								<CardTitle className="flex items-center justify-between">
									<span className="w-full text-lg">{task.name}</span>
									<DropdownMenuTrigger>
										<MoreHorizontalIcon className="text-muted-foreground" />
									</DropdownMenuTrigger>
								</CardTitle>
								<span className="text-xs text-muted-foreground">
									{task.createdAt.toDateString()}
								</span>
								<div className="flex flex-wrap items-center gap-2">
									{task.tags.map((tag) => (
										<TagComponent key={tag.id} title={tag.name} colorName={tag.color} />
									))}
								</div>
								<CardDescription className="w-full text-black dark:text-white">
									{task.description}
								</CardDescription>
							</CardHeader>
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
							</DropdownMenuContent>
						</Card>
					</DropdownMenu>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the task and remove it
								from our servers.
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
							<DialogTitle>Edit Task</DialogTitle>
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
								</div>
								<DialogFooter className="sm:justify-start">
									<Button className="mt-4 px-4" disabled={isLoading} type="submit">
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

export default TaskCard;
