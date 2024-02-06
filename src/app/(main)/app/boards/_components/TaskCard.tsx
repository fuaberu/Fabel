"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tag, Task } from "@prisma/client";
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MoreHorizontalIcon, Trash } from "lucide-react";
import TagComponent from "./TagComponent";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { updateTaskPositionDb } from "../actions";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
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
import { z } from "zod";
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
import { useModal } from "@/providers/ModalProvider";
import CustomModal from "@/components/global/CustomModal";
import TaskForm from "./forms/TaskForm";
import { smallDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

interface Props {
	task: Task & { tags: Tag[] };
	deleteTask: (id: string) => Promise<void>;
	updateTask: (data: z.infer<typeof TaskFormSchema>, id: string) => Promise<void>;
	setUnsavedChanges: Dispatch<SetStateAction<boolean>>;
	isOverlay?: boolean;
}

function TaskCard({ task, deleteTask, setUnsavedChanges, updateTask, isOverlay }: Props) {
	const { setModalOpen } = useModal();

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

	const pathname = usePathname();

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		await deleteTask(task.id);
		setIsDeleting(false);
		setIsDeleteOpen(false);
	};

	const handleEdit = () => {
		setModalOpen(
			<CustomModal title="Edit Task">
				<TaskForm task={task} update={updateTask} />
			</CustomModal>,
		);
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
				className="relative flex h-40 max-h-40 min-h-40 items-center rounded-md border-2 border-primary text-left"
			/>
		);
	}

	return (
		<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
			<div
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
				className="relative flex h-40 max-h-40 min-h-40 items-center overflow-hidden rounded-md text-left"
			>
				<DropdownMenu>
					<Card
						className="h-full w-full bg-white/50 shadow-none transition-all hover:ring-2 hover:ring-inset hover:ring-primary dark:bg-slate-900/50"
						onClick={handleEdit}
					>
						<CardHeader className="p-[12px]">
							<CardTitle className="flex items-center justify-between">
								<span className="w-full text-lg">{task.name}</span>
								<DropdownMenuTrigger>
									<MoreHorizontalIcon className="text-muted-foreground" />
								</DropdownMenuTrigger>
							</CardTitle>
							{task.dueDate && (
								<span
									className={cn(
										"text-xs text-muted-foreground",
										task.dueDate < new Date()
											? "text-red-500"
											: task.dueDate.toDateString() === new Date().toDateString()
												? "text-yellow-500"
												: "text-green-500",
									)}
								>
									{smallDateTime(task.dueDate)}
								</span>
							)}
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

							<DropdownMenuItem className="flex items-center gap-2" onClick={handleEdit}>
								<Edit size={15} />
								Edit
							</DropdownMenuItem>

							<AlertDialogTrigger id="delete" asChild>
								<DropdownMenuItem className="flex items-center gap-2">
									<Trash size={15} />
									Delete
								</DropdownMenuItem>
							</AlertDialogTrigger>
						</DropdownMenuContent>
					</Card>
				</DropdownMenu>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the task and remove it from
							our servers.
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
			</div>
		</AlertDialog>
	);
}

export default TaskCard;
