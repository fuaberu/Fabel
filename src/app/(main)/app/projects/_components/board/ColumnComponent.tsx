"use client";

import { FC } from "react";
import { Column, Tag, Task } from "@prisma/client";
import TaskComponent from "./TaskComponent";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
	updateTask?: (task: Task & { tags: Tag[] }, column: Column) => void;
	createTask?: (column: Column) => void;
	deleteTask?: (id: string) => void;
	deleteColumn?: (id: string) => void;
	updateColumn?: (column: Column) => void;
}

const ColumnComponent: FC<Props> = ({
	column,
	updateTask,
	createTask,
	deleteTask,
	deleteColumn,
	updateColumn,
}) => {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: column.id,
		data: { type: "column", column },
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="flex h-full w-80	min-w-80 flex-col rounded-md border-2 border-primary"
			></div>
		);
	}

	return (
		<div
			className="flex h-full w-80 min-w-80 flex-col rounded-md bg-slate-300/30 dark:bg-background/40"
			ref={setNodeRef}
			style={style}
		>
			<div
				className="flex items-center justify-end rounded-t-md bg-slate-300/60 px-3 py-1 dark:bg-background/60"
				{...attributes}
				{...listeners}
			>
				<span className="mr-auto text-sm font-bold">{column.name}</span>
				<Button variant="ghost" size="icon" onClick={() => createTask && createTask(column)}>
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
							onClick={() => updateColumn && updateColumn(column)}
						>
							<Edit size={15} />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => deleteColumn && deleteColumn(column.id)}
						>
							<Trash size={15} />
							Delete
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => createTask && createTask(column)}
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
				<div className="styled-scrollbar flex h-full w-full flex-col gap-2 overflow-y-auto p-3">
					{column.tasks.map((task) => (
						<TaskComponent
							task={task}
							column={column}
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
