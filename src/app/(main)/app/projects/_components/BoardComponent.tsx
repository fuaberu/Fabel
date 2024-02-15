"use client";

import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	UniqueIdentifier,
	closestCorners,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { Column, Tag, Task } from "@prisma/client";
import ColumnComponent from "./ColumnComponent";
import { createPortal } from "react-dom";
import TaskComponent from "./TaskComponent";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
	createColumnDb,
	createTaskDb,
	deleteColumnDb,
	deleteTaskDb,
	updateColumnDb,
	updateTaskDb,
	updateTaskPositionDb,
} from "../actions";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/global/Spinner";
import { useModal } from "@/providers/ModalProvider";
import CustomModal from "@/components/global/CustomModal";
import TaskForm from "../_forms/TaskForm";
import { ColumnFormSchema, TaskFormSchema } from "@/schemas/board";
import { z } from "zod";
import AlertForm from "@/components/global/AlertForm";
import { BoardApp } from "./ClientPage";
import ColumnForm from "../_forms/ColumnForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
	board: BoardApp;
	setBoard: Dispatch<SetStateAction<BoardApp>>;
}
const BoardComponent: FC<Props> = ({ board, setBoard }) => {
	const [activeTask, setActiveTask] = useState<(Task & { tags: Tag[] }) | null>(null);
	const [previousActive, setPreviousActive] = useState<(Task & { tags: Tag[] }) | null>(null);

	const [unsavedChanges, setUnsavedChanges] = useState(false);

	const { setModalOpen } = useModal();

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

	const pathname = usePathname();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex h-full flex-1 gap-2 overflow-x-auto">
					{board.columns.map((column) => (
						<ColumnComponent
							column={column}
							key={column.id}
							updateTask={handleUpdateTask}
							createTask={handleCreateTask}
							deleteTask={handleDeleteTask}
							deleteColumn={handleDeleteColumn}
							updateColumn={handleUpdateColumn}
						/>
					))}
					{createPortal(
						<DragOverlay>
							{activeTask && <TaskComponent columnStatus="NONE" task={activeTask} />}
						</DragOverlay>,
						document.body,
					)}

					<Button className="mt-1" onClick={handleCreateColumn}>
						<Plus /> Create Column
					</Button>
				</div>
			</DndContext>
			{unsavedChanges && (
				<div className="absolute bottom-4 right-4">
					<Spinner />
				</div>
			)}
		</>
	);

	// DnD Functions
	function findColumnIndex(id: UniqueIdentifier | undefined) {
		let find = board.columns.findIndex((c) => c.id === id);

		if (find < 0) find = board.columns.findIndex((c) => !!c.tasks.find((t) => t.id === id));
		return find;
	}

	function handleDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === "task") {
			setActiveTask(event.active.data.current.task);
			setPreviousActive({ ...event.active.data.current.task });
		}
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;

		if (!over || active.data.current?.type !== "task" || !active) return;

		// Find the containers
		const activeColumnIndex = findColumnIndex(active.id);
		const overColumnIndex = findColumnIndex(over.id);

		if (activeColumnIndex < 0 || overColumnIndex < 0 || active.id === over.id) {
			return;
		}

		let called = false;
		setBoard((prev) => {
			if (!active.data.current || called) return prev;
			called = true;

			// Remove active task from previous column
			prev.columns[activeColumnIndex].tasks = prev.columns[activeColumnIndex].tasks.filter(
				(t) => t.id !== active.id,
			);

			if (over.data.current?.type !== "task") {
				active.data.current.task.columnId = over.id;
				active.data.current.task.order = 1;
				prev.columns[overColumnIndex].tasks = [active.data.current?.task];
				return prev;
			}

			const overTaskIndex = prev.columns[overColumnIndex].tasks.findIndex((t) => t.id === over.id);

			let alter = -1;
			if (
				active.data.current.task.columnId === over.data.current.task.columnId &&
				active.data.current.task.order < over.data.current.task.order
			) {
				alter = 1;
			}

			let newOrder = 0;

			let previousOverTask = prev.columns[overColumnIndex].tasks[overTaskIndex + alter]?.order || 0;

			if (overTaskIndex === prev.columns[overColumnIndex].tasks.length - 1) {
				// Over last task
				previousOverTask = prev.columns[overColumnIndex].tasks[overTaskIndex].order + 1;
			}

			const currentOverTask = prev.columns[overColumnIndex].tasks[overTaskIndex];

			newOrder = (currentOverTask.order + previousOverTask) / 2;

			// Add information to task
			active.data.current.task.columnId = prev.columns[overColumnIndex].id;
			active.data.current.task.order = newOrder;

			prev.columns[overColumnIndex].tasks = [
				...prev.columns[overColumnIndex].tasks.slice(0, newOrder),
				active.data.current.task,
				...prev.columns[overColumnIndex].tasks.slice(
					newOrder,
					prev.columns[overColumnIndex].tasks.length,
				),
			];

			return prev;
		});
	}

	async function handleDragEnd(event: DragEndEvent) {
		const { active } = event;

		if (!active.data.current || !previousActive) return;

		if (
			active.data.current.task.order != previousActive.order ||
			active.data.current.task.columnId != previousActive.columnId
		) {
			setUnsavedChanges(true);

			try {
				await updateTaskPositionDb(active.data.current.task, pathname);
			} catch (error) {
				toast.error("Error updating task position");
			}

			setUnsavedChanges(false);
		}

		// Reset active handlerers
		setActiveTask(null);
		setPreviousActive(null);
	}

	// Tasks CRUD functions
	async function updateTask(data: z.infer<typeof TaskFormSchema>, id: string) {
		setUnsavedChanges(true);

		try {
			await updateTaskDb(id, data, pathname);

			const activeColumnIndex = findColumnIndex(id);
			const activeIndex = board.columns[activeColumnIndex].tasks.findIndex((t) => t.id === id);

			if (activeColumnIndex < 0 || activeIndex < 0) throw new Error("Wrong index");

			setBoard((prev) => {
				prev.columns[activeColumnIndex].tasks[activeIndex] = {
					...prev.columns[activeColumnIndex].tasks[activeIndex],
					...data,
				};

				return { ...prev };
			});
		} catch (error) {
			toast.error("Erro updating Task");
		}

		setUnsavedChanges(false);
	}

	function handleUpdateTask(task: Task & { tags: Tag[] }) {
		setModalOpen(
			<CustomModal title="Edit Task" size="lg">
				<TaskForm task={task} update={updateTask} />
			</CustomModal>,
		);
	}

	async function createTask(data: z.infer<typeof TaskFormSchema>, columnId: string) {
		setUnsavedChanges(true);

		try {
			const activeColumnIndex = findColumnIndex(columnId);

			if (activeColumnIndex < 0) throw new Error("Wrong index");

			const newTask = await createTaskDb({ ...data, columnId }, pathname);

			let called = false;
			setBoard((prev) => {
				if (called) return prev;
				called = true;

				prev.columns[activeColumnIndex].tasks.push(newTask);

				return prev;
			});
		} catch (error) {
			console.error(error);
			toast.error("Erro creating Task");
		}

		setUnsavedChanges(false);
	}

	function handleCreateTask(columnId: string) {
		setModalOpen(
			<CustomModal title="Create Task">
				<TaskForm columnId={columnId} create={createTask} />
			</CustomModal>,
		);
	}

	async function deleteTask(id: string) {
		setUnsavedChanges(true);

		try {
			const activeColumnIndex = findColumnIndex(id);

			if (activeColumnIndex < 0) throw new Error("Wrong index");

			await deleteTaskDb(id, pathname);

			let called = false;
			setBoard((prev) => {
				if (called) return prev;
				called = true;

				prev.columns[activeColumnIndex].tasks = prev.columns[activeColumnIndex].tasks.filter(
					(t) => t.id !== id,
				);

				return prev;
			});
		} catch (error) {
			console.error(error);
			toast.error("Erro deleting Task");
		}

		setUnsavedChanges(false);
	}

	function handleDeleteTask(id: string) {
		setModalOpen(
			<CustomModal title="Delete Task">
				<AlertForm
					action={() => deleteTask(id)}
					description="Are you sure? this action is irreversible"
				/>
			</CustomModal>,
		);
	}

	// Column CRUD functions
	async function createColumn({ name }: { name?: string }) {
		setUnsavedChanges(true);

		try {
			const columnToAdd = await createColumnDb(
				{
					name: name || `Column ${board.columns.length + 1}`,
					board: { connect: { id: board.id } },
					order: board.columns.length + 1,
				},
				pathname,
			);

			setBoard((prev) => ({ ...prev, columns: [...prev.columns, { ...columnToAdd, tasks: [] }] }));
		} catch (error) {
			toast.error("Erro creating Column");
		}

		setUnsavedChanges(false);
	}

	function handleCreateColumn() {
		setModalOpen(
			<CustomModal title="Create Column">
				<ColumnForm create={createColumn} />
			</CustomModal>,
		);
	}

	async function updateColumn(data: z.infer<typeof ColumnFormSchema>, id: string) {
		setUnsavedChanges(true);

		const activeColumnIndex = findColumnIndex(id);

		if (activeColumnIndex < 0) throw new Error("Wrong index");

		try {
			await updateColumnDb(id, data, pathname);

			setBoard((prev) => {
				prev.columns[activeColumnIndex].name = data.name;
				prev.columns[activeColumnIndex].description = data.description;
				prev.columns[activeColumnIndex].taskStatus = data.taskStatus;

				return { ...prev };
			});
		} catch (error) {
			toast.error("Erro creating Column");
		}

		setUnsavedChanges(false);
	}

	function handleUpdateColumn(column: Column) {
		setModalOpen(
			<CustomModal title="Update Column">
				<ColumnForm update={updateColumn} column={column} />
			</CustomModal>,
		);
	}

	async function deleteColumn(id: string) {
		setUnsavedChanges(true);

		try {
			await deleteColumnDb(id, pathname);

			let called = false;
			setBoard((prev) => {
				if (called) return prev;
				called = true;

				prev.columns = prev.columns.filter((c) => c.id !== id);

				return prev;
			});
		} catch (error) {
			console.error(error);
			toast.error("Erro deleting Column");
		}

		setUnsavedChanges(false);
	}

	function handleDeleteColumn(id: string) {
		setModalOpen(
			<CustomModal title="Delete Column">
				<AlertForm
					action={() => deleteColumn(id)}
					description="Are you sure? this action is irreversible"
				/>
			</CustomModal>,
		);
	}
};

export default BoardComponent;
