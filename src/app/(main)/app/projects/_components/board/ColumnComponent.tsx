"use client";

import { FC, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Column, Tag, Task } from "@prisma/client";
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
import { Edit, MoreVertical, Plus, PlusCircleIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
	column: Column & { tasks: (Task & { tags: Tag[] })[] };
	updateTask: (task: Task & { tags: Tag[] }) => void;
	createTask: (columnId: string) => void;
	deleteTask: (id: string) => void;
	deleteColumn: (id: string) => void;
	updateColumn: (column: Column) => void;
}

const ColumnComponent: FC<Props> = ({
	column,
	updateTask,
	createTask,
	deleteTask,
	deleteColumn,
	updateColumn,
}) => {
	const { setNodeRef } = useDroppable({
		id: column.id,
		data: {
			type: "column",
		},
	});

	const orderdTasks = useMemo(() => column.tasks.sort((a, b) => a.order - b.order), [column.tasks]);

	return (
		<div className="flex h-full w-80 min-w-80 flex-col rounded-md bg-slate-300/30 dark:bg-background/40">
			<div className="flex items-center justify-end rounded-t-md bg-slate-300/60 px-3 py-1 dark:bg-background/60">
				<span className="mr-auto text-sm font-bold">{column.name}</span>
				<Button variant="ghost" size="icon" onClick={() => createTask(column.id)}>
					<Plus className="cursor-pointer text-muted-foreground" />
				</Button>
				<DropdownMenu>
					<Button variant="ghost" size="icon" asChild>
						<DropdownMenuTrigger>
							<MoreVertical className="cursor-pointer text-muted-foreground" />
						</DropdownMenuTrigger>
					</Button>
					<DropdownMenuContent>
						<DropdownMenuLabel>Options</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => updateColumn(column)}
						>
							<Edit size={15} />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => deleteColumn(column.id)}
						>
							<Trash size={15} />
							Delete
						</DropdownMenuItem>

						<DropdownMenuSeparator />

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
				<div
					ref={setNodeRef}
					className="styled-scrollbar flex h-full w-full flex-col gap-2 overflow-y-auto p-3"
				>
					{orderdTasks.map((task) => (
						<TaskComponent
							task={task}
							columnStatus={column.taskStatus}
							key={task.id}
							update={updateTask}
							deleteT={deleteTask}
						/>
					))}
				</div>
			</SortableContext>
		</div>
	);
};

export default ColumnComponent;
