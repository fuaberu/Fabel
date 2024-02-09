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
	updateTaskPositionDb,
} from "../actions";
import ColumnForm from "./ColumnForm";
import { usePathname } from "next/navigation";
import { z } from "zod";
import { TaskFormSchema } from "@/schemas/board";
import { getUTCTime } from "@/lib/datetime";
import Spinner from "@/components/global/Spinner";

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

	// Tasks
	const createTask = async (data: z.infer<typeof TaskFormSchema>, columnId: string) => {
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
	};

	const updateTask = async (data: z.infer<typeof TaskFormSchema>, id: string) => {
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
	};

	const deleteTask = async (id: string) => {
		setUnsavedChanges(true);

		try {
			await deleteTaskDb(id, pathname);
			setTasks((ts) => ts.filter((task) => task.id !== id));
		} catch (error) {
			toast.error("Erro deleting Task");
		}

		setUnsavedChanges(false);
	};

	// Columns
	const createNewColumn = async ({ name }: { name?: string }) => {
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
	};

	const updateColumn = async (id: string, data: Partial<Task>) => {
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
	};

	const deleteColumn = async (id: string) => {
		setUnsavedChanges(true);

		try {
			await deleteColumnDb(id, pathname);
			setColumns((cs) => cs.filter((col) => col.id !== id));

			setTasks((ts) => ts.filter((t) => t.columnId !== id));
		} catch (error) {
			toast.error("Erro deleting Column");
		}

		setUnsavedChanges(false);
	};

	// Actions
	const onDragStart = (event: DragStartEvent) => {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}

		if (event.active.data.current?.type === "Task") {
			setActiveTask(event.active.data.current.task);
			return;
		}
	};

	const onDragEnd = async (event: DragEndEvent) => {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;

		if (active.data.current?.type === "Column" && over?.data.current?.type === "Column") {
			// Move Column
			const activeColumnIndex = columns.findIndex((c) => c.id === active.id);
			const overColumnIndex = columns.findIndex((c) => c.id === over.id);

			setColumns((columns) => {
				const newColumns = [...columns];
				newColumns[overColumnIndex] = columns[activeColumnIndex];
				newColumns[activeColumnIndex] = columns[overColumnIndex];
				return newColumns;
			});

			// Save in database
			setUnsavedChanges(true);

			try {
				await updateOrderColumnDb(
					{ id: active.id as string, order: overColumnIndex },
					{ id: over.id as string, order: activeColumnIndex },
					pathname,
				);
			} catch (error) {
				toast.error("Error updating task position");
			}

			setUnsavedChanges(false);
		} else if (active.data.current?.type === "Task" && over?.data.current?.type === "Task") {
			const activeTaskIndex = tasks.findIndex((t) => t.id === active.id);

			// Save in database
			setUnsavedChanges(true);

			try {
				await updateTaskPositionDb(tasks[activeTaskIndex], pathname);
			} catch (error) {
				toast.error("Error updating task position");
			}

			setUnsavedChanges(false);
		}
	};

	const onDragOver = (event: DragOverEvent) => {
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
			// Move Task
			const activeTaskIndex = tasks.findIndex((t) => t.id === active.id);
			const overTaskIndex = tasks.findIndex((t) => t.id === over.id);

			setTasks((tasksData) => {
				const newTasks = [...tasksData];
				newTasks[overTaskIndex] = tasksData[activeTaskIndex];
				newTasks[overTaskIndex].order = overTaskIndex;
				newTasks[overTaskIndex].updatedAt = new Date();

				newTasks[activeTaskIndex] = tasksData[overTaskIndex];
				newTasks[activeTaskIndex].order = activeTaskIndex;
				newTasks[activeTaskIndex].updatedAt = new Date();

				return newTasks;
			});
		}

		const isOverAColumn = over.data.current?.type === "Column";

		// Im dropping a Task over a column
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				tasks[activeIndex].columnId = overId.toString();
				tasks[activeIndex].order = 0;
				tasks[activeIndex].updatedAt = new Date();

				return arrayMove(tasks, activeIndex, activeIndex);
			});
		}
	};

	return (
		<div className="h-full w-full overflow-x-auto overflow-y-hidden">
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
			{unsavedChanges && (
				<div className="absolute bottom-4 right-4">
					<Spinner />
				</div>
			)}
		</div>
	);
}

export default KanbanBoard;
