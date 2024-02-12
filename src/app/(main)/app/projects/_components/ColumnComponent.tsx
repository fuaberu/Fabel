"use client";

import { useDroppable } from "@dnd-kit/core";
import { Column, Tag, Task } from "@prisma/client";
import { FC } from "react";
import TaskComponent from "./TaskComponent";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
	column: Column & { tasks: (Task & { tags: Tag[] })[] };
	updateTask: (task: Task) => void;
	createTask: (columnId: string) => void;
	deleteTask: (id: string) => void;
}

const ColumnComponent: FC<Props> = ({ column, updateTask, createTask, deleteTask }) => {
	const { setNodeRef } = useDroppable({
		id: column.id,
		data: {
			type: "column",
		},
	});

	return (
		<div className="flex h-full w-80 flex-col rounded-md bg-slate-300/30 dark:bg-background/40">
			<div className="flex items-center justify-between rounded-t-md bg-slate-300/60 p-3 dark:bg-background/60">
				<span className="text-sm font-bold">{column.name}</span>
				<DropdownMenu>
					<Button variant="ghost" size="icon" asChild>
						<DropdownMenuTrigger>
							<MoreVertical className="cursor-pointer text-muted-foreground" />
						</DropdownMenuTrigger>
					</Button>
					<DropdownMenuContent>
						<DropdownMenuLabel>Options</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{/* <DialogTrigger id="edit" asChild>
						<DropdownMenuItem className="flex items-center gap-2">
							<Edit size={15} />
							Edit
						</DropdownMenuItem>
					</DialogTrigger>

					<AlertDialogTrigger id="delete" asChild>
						<DropdownMenuItem className="flex items-center gap-2">
							<Trash size={15} />
							Delete
						</DropdownMenuItem>
					</AlertDialogTrigger> */}

						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => createTask(column.id)}
						>
							<PlusCircleIcon size={15} />
							Create Ticket
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<SortableContext
				id={column.id}
				items={column.tasks.map((t) => t.id)}
				strategy={verticalListSortingStrategy}
			>
				<div ref={setNodeRef} className="flex h-full w-full flex-col gap-2 p-3">
					{column.tasks.map((task) => (
						<TaskComponent task={task} key={task.id} update={updateTask} deleteT={deleteTask} />
					))}
				</div>
			</SortableContext>
		</div>
	);
};

export default ColumnComponent;
