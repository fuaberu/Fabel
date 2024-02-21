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
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
	createColumnDb,
	createTaskDb,
	deleteColumnDb,
	deleteTaskDb,
	updateColumnDb,
	updateColumnPositionDb,
	updateTaskDb,
	updateTaskPositionDb,
} from "../../actions";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/global/Spinner";
import { useModal } from "@/providers/ModalProvider";
import CustomModal from "@/components/global/CustomModal";
import TaskForm from "../../_forms/TaskForm";
import { ColumnFormSchema, TaskFormSchema } from "@/schemas/board";
import { z } from "zod";
import AlertForm from "@/components/global/AlertForm";
import { BoardApp } from "../ClientPage";
import ColumnForm from "../../_forms/ColumnForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
	board: BoardApp;
	setBoard: Dispatch<SetStateAction<BoardApp>>;
}
const BoardComponent: FC<Props> = ({ board, setBoard }) => {
	const [activeTask, setActiveTask] = useState<(Task & { tags: Tag[] }) | null>(null);
	const [previousActiveTask, setPreviousActiveTask] = useState<(Task & { tags: Tag[] }) | null>(
		null,
	);

	const [activeColumn, setActiveColumn] = useState<
		(Column & { tasks: (Task & { tags: Tag[] })[] }) | null
	>(null);
	const [previousActiveColumn, setPreviousActiveColumn] = useState<
		(Column & { tasks: (Task & { tags: Tag[] })[] }) | null
	>(null);

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

	const router = useRouter();
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
					<SortableContext items={board.columns.map((t) => t.id)}>
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
					</SortableContext>
					{createPortal(
						<DragOverlay>
							{activeTask && <TaskComponent columnStatus="NONE" task={activeTask} />}
							{activeColumn && <ColumnComponent column={activeColumn} />}
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
			setPreviousActiveTask({ ...event.active.data.current.task });
		} else if (event.active.data.current?.type === "column") {
			setActiveColumn(event.active.data.current.column);
			setPreviousActiveColumn({ ...event.active.data.current.column });
		}
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;

		if (!over || !active) return;

		// Find the containers
		const activeColumnIndex = findColumnIndex(active.id);
		const overColumnIndex = findColumnIndex(over.id);

		if (
			activeColumnIndex < 0 ||
			overColumnIndex < 0 ||
			active.id === over.id ||
			!over.data.current
		) {
			return;
		}

		setBoard((prev) => {
			if (!active.data.current || !over.data.current) return prev;

			if (active.data.current.type === "task") {
				// Is over an other task
				const isOverTask = over.data.current?.type === "task";

				// Is over a column
				const isOverColumn = over.data.current?.type === "column";

				// Is same column
				let isSameColumn = false;

				if (isOverTask) {
					isSameColumn = active.data.current.task.columnId === over.data.current.task.columnId;
				} else if (isOverColumn) {
					isSameColumn = active.data.current.task.columnId === over.id;
				}

				// Remove active task from previous column
				prev.columns[activeColumnIndex].tasks = prev.columns[activeColumnIndex].tasks.filter(
					(t) => t.id !== active.id,
				);

				if (!isSameColumn) {
					// Add column id to active task
					active.data.current.task.columnId = prev.columns[overColumnIndex].id;
				}

				if (isOverColumn) {
					const isColumnEmpty = prev.columns[overColumnIndex].tasks.length === 0;

					if (isColumnEmpty) {
						active.data.current.task.order = 1;
						prev.columns[overColumnIndex].tasks = [active.data.current.task];
					} else {
						active.data.current.task.order =
							prev.columns[overColumnIndex].tasks[prev.columns[overColumnIndex].tasks.length - 1]
								.order + 1;

						prev.columns[overColumnIndex].tasks = [
							...prev.columns[overColumnIndex].tasks,
							active.data.current.task,
						];
					}

					return prev;
				} else {
					// Over another task
					// Get the over task index
					const overTaskIndex = prev.columns[overColumnIndex].tasks.findIndex(
						(t) => t.id === over.id,
					);

					// Get the over task order
					const overTaskOrder = over.data.current.task.order;

					let newOrder = 1;

					if (isSameColumn) {
						// Is under the task
						const isUnder = active.data.current.task.order >= over.data.current.task.order;

						if (isUnder) {
							// Get the closest lower task order
							const lowerTaskOrder =
								overTaskIndex > 0
									? prev.columns[overColumnIndex].tasks[overTaskIndex - 1].order
									: 0;

							// Get the new order
							newOrder = (overTaskOrder + lowerTaskOrder) / 2;
						} else {
							if (overTaskIndex < prev.columns[overColumnIndex].tasks.length - 1) {
								// Not last task
								newOrder =
									(overTaskOrder + prev.columns[overColumnIndex].tasks[overTaskIndex + 1].order) /
									2;
							} else {
								// Last task
								newOrder =
									prev.columns[overColumnIndex].tasks[
										prev.columns[overColumnIndex].tasks.length - 1
									].order + 1;
							}
						}
					} else {
						if ((active.rect.current.initial?.top || 0) - 10 <= over.rect.top) {
							// Get the closest lower task order
							const lowerTaskOrder =
								overTaskIndex > 0
									? prev.columns[overColumnIndex].tasks[overTaskIndex - 1].order
									: 0;

							// Get the new order
							newOrder = (overTaskOrder + lowerTaskOrder) / 2;
						} else {
							if (overTaskIndex < prev.columns[overColumnIndex].tasks.length - 1) {
								// Not last task
								newOrder =
									(overTaskOrder + prev.columns[overColumnIndex].tasks[overTaskIndex + 1].order) /
									2;
							} else {
								// Last task
								newOrder =
									prev.columns[overColumnIndex].tasks[
										prev.columns[overColumnIndex].tasks.length - 1
									].order + 1;
							}
						}
					}

					// Add order to task
					active.data.current.task.order = newOrder;

					// Add task to column
					prev.columns[overColumnIndex].tasks.push(active.data.current.task);

					// Sort the tasks
					prev.columns[overColumnIndex].tasks.sort((a, b) => a.order - b.order);
				}
			} else if (active.data.current?.type === "column" && over.data.current?.type === "column") {
				let newOrder = 1;
				if (overColumnIndex === 0) {
					newOrder = prev.columns[0].order / 2;
				} else if (overColumnIndex === prev.columns.length - 1) {
					newOrder = prev.columns[overColumnIndex].order + 1;
				} else {
					const varia = activeColumnIndex < overColumnIndex ? 1 : -1;

					newOrder =
						(prev.columns[overColumnIndex].order + prev.columns[overColumnIndex + varia].order) / 2;
				}

				prev.columns[activeColumnIndex].order = newOrder;

				prev.columns.sort((a, b) => a.order - b.order);
			}

			return prev;
		});
	}

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (active.data.current?.type === "task") {
			if (!previousActiveTask) return;

			if (over?.data.current?.type === "task" && active.id !== over.id) {
				setBoard((prev) => {
					if (!active.data.current?.task || !over?.data.current?.task) return prev;

					const activeColumnIndex = findColumnIndex(active.id);

					prev.columns[activeColumnIndex].tasks = prev.columns[activeColumnIndex].tasks.filter(
						(t) => t.id !== active.id,
					);

					const overColumnIndex = findColumnIndex(over.id);

					const overTaskIndex = board.columns[overColumnIndex].tasks.findIndex(
						(t) => t.id === over.id,
					);

					// Get the over task order
					const overTaskOrder = over.data.current.task.order;

					const isUnder = active.data.current.task.order >= over.data.current.task.order;

					let newOrder = active.data.current.task.order;
					if (isUnder) {
						// Get the closest lower task order
						const lowerTaskOrder =
							overTaskIndex > 0 ? prev.columns[overColumnIndex].tasks[overTaskIndex - 1].order : 0;

						// Get the new order
						newOrder = (overTaskOrder + lowerTaskOrder) / 2;
					} else {
						if (overTaskIndex < prev.columns[overColumnIndex].tasks.length - 1) {
							// Not last task
							newOrder =
								(overTaskOrder + prev.columns[overColumnIndex].tasks[overTaskIndex + 1].order) / 2;
						} else {
							// Last task
							newOrder =
								prev.columns[overColumnIndex].tasks[prev.columns[overColumnIndex].tasks.length - 1]
									.order + 1;
						}
					}

					active.data.current.task.order = newOrder;

					// Add task to column
					prev.columns[overColumnIndex].tasks.push(active.data.current.task);

					// Sort the tasks
					prev.columns[overColumnIndex].tasks.sort((a, b) => a.order - b.order);

					return prev;
				});
			}

			if (
				active.data.current.task.order != previousActiveTask.order ||
				active.data.current.task.columnId != previousActiveTask.columnId
			) {
				setUnsavedChanges(true);

				try {
					await updateTaskPositionDb(
						{
							id: active.data.current.task.id,
							order: active.data.current.task.order,
							columnId: active.data.current.task.columnId,
						},
						pathname,
					);
				} catch (error) {
					router.refresh();
					toast.error("Error updating task position");
				}

				setUnsavedChanges(false);
			}
		} else if (active.data.current?.type === "column") {
			if (!previousActiveColumn) return;

			if (active.data.current.column.order != previousActiveColumn.order) {
				setUnsavedChanges(true);

				try {
					await updateColumnPositionDb(
						{ id: active.data.current.column.id, order: active.data.current.column.order },
						pathname,
					);
				} catch (error) {
					router.refresh();
					toast.error("Error updating column position");
				}

				setUnsavedChanges(false);
			}
		}

		// Reset active handlerers
		setActiveTask(null);
		setPreviousActiveTask(null);
		setActiveColumn(null);
		setPreviousActiveColumn(null);
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

			const newTask = await createTaskDb(
				{ ...data, columnId, order: board.columns[activeColumnIndex].tasks?.length + 1 || 1 },
				pathname,
			);

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
