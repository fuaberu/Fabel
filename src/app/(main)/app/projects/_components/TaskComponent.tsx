import { FC, useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { Tag, Task, TaskStatus } from "@prisma/client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { smallDateTime } from "@/lib/datetime";
import { useSortable } from "@dnd-kit/sortable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCheck, Edit, MoreHorizontalIcon, Trash } from "lucide-react";
import { isPast, isToday } from "date-fns";
import TagComponent from "./TagComponent";

interface Props {
	columnStatus: TaskStatus;
	task: Task & { tags: Tag[] };
	update?: (task: Task & { tags: Tag[] }) => void;
	deleteT?: (id: string) => void;
}

const TaskComponent: FC<Props> = ({ task, columnStatus, update, deleteT }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: {
			task,
			type: "task",
		},
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	const dateColor = useMemo(() => {
		if (task.dueDate) {
			if (columnStatus === "DONE") {
				return "text-emerald-500";
			}
			if (isPast(task.dueDate)) {
				return "text-red-500";
			} else if (isToday(task.dueDate)) {
				return "text-yellow-500";
			}
		}
		return "";
	}, [columnStatus, task.dueDate]);

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<Card
				className={cn(
					"max-h-40 bg-white/50 ring-primary transition-all hover:ring-2 dark:bg-slate-900/50",
					isDragging && "bg-transparent ring-2",
				)}
				onClick={() => update && update(task)}
			>
				<CardHeader className={cn("p-3", isDragging && "opacity-0")}>
					<CardTitle className="flex items-center justify-between">
						<span className="line-clamp-1 w-full text-lg">{task.name}</span>
						<DropdownMenu>
							<Button variant="ghost" size="icon" asChild className="hover:bg-primary/20">
								<DropdownMenuTrigger>
									<MoreHorizontalIcon className="cursor-pointer text-muted-foreground" />
								</DropdownMenuTrigger>
							</Button>
							<DropdownMenuContent>
								<DropdownMenuLabel>Options</DropdownMenuLabel>
								<DropdownMenuSeparator />

								<DropdownMenuItem
									className="flex items-center gap-2"
									onClick={() => update && update(task)}
								>
									<Edit size={15} />
									Edit
								</DropdownMenuItem>

								<DropdownMenuItem
									className="flex items-center gap-2"
									onClick={(e) => {
										e.stopPropagation();
										deleteT && deleteT(task.id);
									}}
								>
									<Trash size={15} />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</CardTitle>
					<CardDescription className="line-clamp-3 max-h-full w-full text-black dark:text-white">
						{task.description}
					</CardDescription>
					<div className="flex flex-wrap items-center gap-2">
						{task.tags.map((tag) => (
							<TagComponent key={tag.id} title={tag.name} color={tag.color} />
						))}
					</div>
					{task.dueDate && (
						<span
							className={cn("flex items-center gap-1 text-xs text-muted-foreground", dateColor)}
						>
							{columnStatus === "DONE" && <CheckCheck size={15} />}
							{smallDateTime(task.dueDate)}
						</span>
					)}
				</CardHeader>
			</Card>
		</div>
	);
};

export default TaskComponent;
