"use client";

import { useEffect, useId, useMemo, useState } from "react";
import ColumnContainer from "./ColumnContainer";
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { Board, Column, Prisma, Tag, Task } from "@prisma/client";
import { toast } from "sonner";
import {
	createColumnDb,
	createTaskDb,
	deleteColumnDb,
	deleteTaskDb,
	updateColumnDb,
	updateOrderColumnDb,
	updateTaskDb,
} from "../actions";
import ColumnForm from "./forms/ColumnForm";
import { usePathname } from "next/navigation";
import { z } from "zod";
import { TaskFormSchema } from "@/schemas/board";
import { getUTCTime } from "@/lib/datetime";

interface Props {
	board: Board;
	defaultColumns: Column[];
	defaultTasks: (Task & { tags: Tag[] })[];
}

function KanbanBoard({ board, defaultTasks, defaultColumns }: Props) {
	const [columns, setColumns] = useState<Column[]>(defaultColumns);

	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const [tasks, setTasks] = useState<(Task & { tags: Tag[] })[]>(defaultTasks);

	const [activeColumn, setActiveColumn] = useState<Column | null>(null);

	const [activeTask, setActiveTask] = useState<(Task & { tags: Tag[] }) | null>(null);

	const [unsavedChanges, setUnsavedChanges] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
	);

	const pathname = usePathname();

	const id = useId();

	useEffect(() => {
		const handleWindowClose = (e: BeforeUnloadEvent) => {
			if (!unsavedChanges) return;
			e.preventDefault();
			return (e.returnValue =
				"Some unsaved changes were detected. Are you sure you want to leave?");
		};

		window.addEventListener("beforeunload", handleWindowClose);

		return () => {
			window.removeEventListener("beforeunload", handleWindowClose);
		};
	}, [unsavedChanges]);

	return (
		<div className="h-full w-full overflow-x-auto">
			<DndContext
				id={id}
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onDragOver={onDragOver}
			>
				<div className="flex h-full gap-2 p-1">
					<SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
						{columns.map((col) => (
							<ColumnContainer
								key={col.id}
								column={col}
								deleteColumn={deleteColumn}
								createTask={createTask}
								deleteTask={deleteTask}
								updateColumn={updateColumn}
								tasks={tasks.filter((task) => task.columnId === col.id)}
								updateTask={updateTask}
								setUnsavedChanges={setUnsavedChanges}
							/>
						))}
					</SortableContext>
					<ColumnForm submitAction={createNewColumn} />
				</div>

				{typeof window !== "undefined" &&
					createPortal(
						<DragOverlay>
							{activeColumn && (
								<ColumnContainer
									column={activeColumn}
									deleteColumn={deleteColumn}
									createTask={createTask}
									deleteTask={deleteTask}
									updateColumn={updateColumn}
									tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
									setUnsavedChanges={setUnsavedChanges}
									updateTask={updateTask}
								/>
							)}
							{activeTask && (
								<TaskCard
									task={activeTask}
									deleteTask={deleteTask}
									setUnsavedChanges={setUnsavedChanges}
									updateTask={updateTask}
									isOverlay
								/>
							)}
						</DragOverlay>,
						document.body,
					)}
			</DndContext>
		</div>
	);

	// Tasks
	async function createTask(data: z.infer<typeof TaskFormSchema>, columnId: string) {
		const order = tasks.filter((t) => t.columnId == columnId).length + 1;

		setUnsavedChanges(true);

		try {
			const newTask = await createTaskDb(
				{
					...data,
					dueDate: getUTCTime(data.dueDate),
					column: { connect: { id: columnId } },
					order,
				},
				pathname,
			);

			setTasks((ts) => [...ts, newTask]);
		} catch (error) {
			toast.error("Erro creating Task");
		}
		setUnsavedChanges(false);
	}

	async function updateTask(data: z.infer<typeof TaskFormSchema>, id: string) {
		setUnsavedChanges(true);

		try {
			await updateTaskDb(
				id,
				{
					...data,
					dueDate: getUTCTime(data.dueDate),
				},
				pathname,
			);

			setTasks((ts) =>
				ts.map((task) =>
					task.id !== id ? task : { ...task, ...data, dueDate: getUTCTime(data.dueDate) },
				),
			);
		} catch (error) {
			toast.error("Erro updating Task");
		}

		setUnsavedChanges(false);
	}

	async function deleteTask(id: string) {
		setUnsavedChanges(true);

		try {
			await deleteTaskDb(id, pathname);
			setTasks((ts) => ts.filter((task) => task.id !== id));
		} catch (error) {
			toast.error("Erro deleting Task");
		}

		setUnsavedChanges(false);
	}

	// Columns
	async function createNewColumn({ name }: { name?: string }) {
		setUnsavedChanges(true);

		try {
			const columnToAdd = await createColumnDb(
				{
					name: name || `Column ${columns.length + 1}`,
					board: { connect: { id: board.id } },
					order: columns.length + 1,
				},
				pathname,
			);

			setColumns((cs) => [...cs, columnToAdd]);
		} catch (error) {
			toast.error("Erro creating Column");
		}

		setUnsavedChanges(false);
	}

	async function updateColumn(id: string, data: Partial<Task>) {
		setUnsavedChanges(true);

		try {
			await updateColumnDb(
				id,
				{
					...data,
				},
				pathname,
			);
			setColumns((cl) => cl.map((column) => (column.id !== id ? column : { ...column, ...data })));
		} catch (error) {
			toast.error("Erro updating Column");
		}

		setUnsavedChanges(false);
	}

	async function deleteColumn(id: string) {
		setUnsavedChanges(true);

		try {
			await deleteColumnDb(id, pathname);
			setColumns((cs) => cs.filter((col) => col.id !== id));

			setTasks((ts) => ts.filter((t) => t.columnId !== id));
		} catch (error) {
			toast.error("Erro deleting Column");
		}

		setUnsavedChanges(false);
	}

	function onDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}

		if (event.active.data.current?.type === "Task") {
			setActiveTask(event.active.data.current.task);
			return;
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;

		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		if (active.data.current?.type === "Task") {
			// Task
			// console.log("task drag end", active.data.current, over.data.current);
		}

		if (activeId === overId) return;

		if (active.data.current?.type === "Column") {
			// Column
			const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

			const overColumnIndex = columns.findIndex((col) => col.id === overId);

			setUnsavedChanges(true);
			toast.promise(
				updateOrderColumnDb(
					{ id: activeId, order: overColumnIndex },
					{ id: overId, order: activeColumnIndex },
				),
				{
					success: (data) => {
						return "success";
					},
					error: (err) => {
						console.log(err);
						return "error";
					},
					finally: () => {
						setUnsavedChanges(false);
					},
				},
			);

			setColumns((columns) => {
				return arrayMove(columns, activeColumnIndex, overColumnIndex);
			});
		} else if (active.data.current?.type === "Task") {
			setTasks((tasksData) => {
				const activeTaskIndex = tasksData.findIndex((task) => task.id === activeId);
				const overTaskIndex = tasksData.findIndex((task) => task.id === overId);

				return arrayMove(tasksData, activeTaskIndex, overTaskIndex);
			});
		}
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const isActiveATask = active.data.current?.type === "Task";
		const isOverATask = over.data.current?.type === "Task";

		if (!isActiveATask) return;

		// Im dropping a Task over another Task
		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const overIndex = tasks.findIndex((t) => t.id === overId);

				if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
					// Fix introduced after video recording
					tasks[activeIndex].columnId = tasks[overIndex].columnId;
					return arrayMove(tasks, activeIndex, overIndex - 1);
				}

				// console.log("DROPPING TASK OVER TASK", { activeIndex, overIndex });
				return arrayMove(tasks, activeIndex, overIndex);
			});
		}

		const isOverAColumn = over.data.current?.type === "Column";

		// Im dropping a Task over a column
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				tasks[activeIndex].columnId = overId.toString();
				// console.log("DROPPING TASK OVER COLUMN", { activeIndex });
				return arrayMove(tasks, activeIndex, activeIndex);
			});
		}
	}
}

function generateId() {
	/* Generate a random number between 0 and 10000 */
	return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
