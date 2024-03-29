"use client";

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react";
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	MouseSensor,
	TouchSensor,
	UniqueIdentifier,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { Column, Tag, Task } from "@prisma/client";
import ColumnComponent from "./ColumnComponent";
import { createPortal } from "react-dom";
import TaskComponent from "./TaskComponent";
import { SortableContext } from "@dnd-kit/sortable";
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
import { useRouter } from "next/navigation";
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
import { useProjects } from "@/providers/ProjectsProvider";
import { UserSession } from "@/auth";
import { v4 as uuid } from "uuid";

interface Props {
	currentUser: UserSession;
	board: BoardApp;
	setBoard: Dispatch<SetStateAction<BoardApp>>;
}

const BoardComponent: FC<Props> = ({ board, setBoard, currentUser }) => {
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
	const { setProjects } = useProjects();

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

	const mouseSensor = useSensor(MouseSensor, {
		// Require the mouse to move by 10 pixels before activating
		activationConstraint: {
			distance: 10,
		},
	});
	const touchSensor = useSensor(TouchSensor, {
		// Press delay of 250ms, with tolerance of 5px of movement
		activationConstraint: {
			delay: 250,
			tolerance: 5,
		},
	});

	const sensors = useSensors(mouseSensor, touchSensor);

	const sortedColumns = useMemo(
		() => board.columns.sort((a, b) => a.order - b.order),
		[board.columns],
	);

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="thin-scrollbar flex h-full flex-1 gap-2 overflow-x-auto pb-1">
					<SortableContext items={sortedColumns.map((t) => t.id)}>
						{sortedColumns.map((column) => (
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
							{activeTask && <TaskComponent task={activeTask} portal />}
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
			!active.data.current ||
			!over.data.current
		) {
			return;
		}

		setBoard((prev) => {
			if (!active.data.current || !over.data.current) return prev;

			if (active.data.current.type === "task") {
				// Remove active task from previous column
				prev.columns[activeColumnIndex].tasks = prev.columns[activeColumnIndex].tasks.filter(
					(t) => t.id !== active.id,
				);

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

					prev.columns[overColumnIndex].tasks = prev.columns[overColumnIndex].tasks.filter(
						(t) => t.id !== active.data.current?.task.id,
					);

					// Add task to column
					prev.columns[overColumnIndex].tasks = [
						...prev.columns[overColumnIndex].tasks,
						active.data.current.task,
					];
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

		// Keep a copy of the previous active handlers because of the db async update
		const previousActiveTaskRecord = previousActiveTask;
		const previousActiveColumnRecord = previousActiveColumn;

		// Reset active handlerers
		setActiveTask(null);
		setPreviousActiveTask(null);
		setActiveColumn(null);
		setPreviousActiveColumn(null);

		if (active.data.current?.type === "task" && over) {
			if (!previousActiveTaskRecord) return;

			const activeColumnIndex = findColumnIndex(active.id);
			const overColumnIndex = findColumnIndex(over.id);

			// Status
			if (
				board.columns[overColumnIndex].taskStatus === "DONE" &&
				!active.data.current?.task.completedDate
			) {
				active.data.current.task.completedDate = new Date();
			} else {
				active.data.current.task.completedDate = null;
			}

			if (over?.data.current?.type === "task" && active.id !== over.id) {
				setBoard((prev) => {
					if (!active.data.current?.task || !over?.data.current?.task) return prev;

					// Remove task from old column
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

					prev.columns[overColumnIndex].tasks = prev.columns[overColumnIndex].tasks.filter(
						(t) => t.id !== active.data.current?.task.id,
					);

					// Add task to column
					prev.columns[overColumnIndex].tasks.push(active.data.current.task);

					// Sort the tasks
					prev.columns[overColumnIndex].tasks.sort((a, b) => a.order - b.order);

					return prev;
				});
			}

			if (
				active.data.current.task.order != previousActiveTaskRecord.order ||
				active.data.current.task.columnId != previousActiveTaskRecord.columnId
			) {
				setUnsavedChanges(true);

				try {
					await updateTaskPositionDb({
						id: active.data.current.task.id,
						order: active.data.current.task.order,
						columnId: active.data.current.task.columnId,
						completedDate: active.data.current.task.completedDate,
					});

					setProjects((prev) =>
						prev.map((p) => {
							if (p.id === board.id && active.data.current?.task.id) {
								p.activities = [
									{
										id: uuid(),
										description: "Updated",
										createdAt: new Date(),
										entityId: active.data.current.task.id,
										type: "TASK",
										user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
									},
									...p.activities,
								];
							}
							return p;
						}),
					);
				} catch (error) {
					router.refresh();
					toast.error("Error updating task position");
				}

				setUnsavedChanges(false);
			}
		} else if (active.data.current?.type === "column" && over) {
			if (!previousActiveColumnRecord) return;

			if (active.data.current.column.order != previousActiveColumnRecord.order) {
				setUnsavedChanges(true);

				try {
					await updateColumnPositionDb({
						id: active.data.current.column.id,
						order: active.data.current.column.order,
					});

					setProjects((prev) =>
						prev.map((p) => {
							if (p.id === board.id && active.data.current?.column.id) {
								p.activities = [
									{
										id: uuid(),
										description: "Updated",
										createdAt: new Date(),
										entityId: active.data.current.column.id,
										type: "COLUMN",
										user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
									},
									...p.activities,
								];
							}
							return p;
						}),
					);
				} catch (error) {
					router.refresh();
					toast.error("Error updating column position");
				}

				setUnsavedChanges(false);
			}
		}
	}

	// Tasks CRUD functions
	async function updateTask(data: z.infer<typeof TaskFormSchema>, id: string) {
		setUnsavedChanges(true);

		try {
			await updateTaskDb(id, data);

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

			setProjects((prev) =>
				prev.map((p) => {
					if (p.id === board.id) {
						p.activities = [
							{
								id: uuid(),
								description: "Updated",
								createdAt: new Date(),
								entityId: id,
								type: "TASK",
								user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
							},
							...p.activities,
						];
					}
					return p;
				}),
			);
		} catch (error) {
			toast.error("Erro updating Task");
		}

		setUnsavedChanges(false);
	}

	function handleUpdateTask(
		task: Task & { tags: Pick<Tag, "id" | "name" | "color">[] },
		column: Column,
	) {
		setModalOpen(
			<CustomModal title="Edit Task" size="lg">
				<TaskForm
					task={task}
					update={updateTask}
					column={column}
					defaultTags={board.tags}
					setBoard={setBoard}
				/>
			</CustomModal>,
		);
	}

	async function createTask(data: z.infer<typeof TaskFormSchema>, columnId: string) {
		setUnsavedChanges(true);

		try {
			const activeColumnIndex = findColumnIndex(columnId);

			if (activeColumnIndex < 0) throw new Error("Wrong index");

			const newTask = await createTaskDb({
				...data,
				columnId,
				order: board.columns[activeColumnIndex].tasks?.length + 1 || 1,
			});

			if (!newTask.data) {
				toast.error("Erro creating Task");
				return;
			}

			let called = false;
			setBoard((prev) => {
				if (called) return prev;
				called = true;

				prev.columns[activeColumnIndex].tasks.push(newTask.data);

				return prev;
			});

			setProjects((prev) =>
				prev.map((p) => {
					if (p.id === board.id) {
						p.activities = [
							{
								id: uuid(),
								description: "Created",
								createdAt: new Date(),
								entityId: newTask.data.id,
								type: "TASK",
								user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
							},
							...p.activities,
						];
					}
					return p;
				}),
			);
		} catch (error) {
			console.error(error);
			toast.error("Erro creating Task");
		}

		setUnsavedChanges(false);
	}

	function handleCreateTask(column: Column) {
		setModalOpen(
			<CustomModal title="Create Task">
				<TaskForm
					column={column}
					create={createTask}
					defaultTags={board.tags}
					setBoard={setBoard}
				/>
			</CustomModal>,
		);
	}

	async function deleteTask(id: string) {
		setUnsavedChanges(true);

		try {
			const activeColumnIndex = findColumnIndex(id);

			if (activeColumnIndex < 0) throw new Error("Wrong index");

			await deleteTaskDb(id);

			let called = false;
			setBoard((prev) => {
				if (called) return prev;
				called = true;

				prev.columns[activeColumnIndex].tasks = prev.columns[activeColumnIndex].tasks.filter(
					(t) => t.id !== id,
				);

				return prev;
			});

			setProjects((prev) =>
				prev.map((p) => {
					if (p.id === board.id) {
						p.activities = [
							{
								id: uuid(),
								description: "Deleted",
								createdAt: new Date(),
								entityId: id,
								type: "TASK",
								user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
							},
							...p.activities,
						];
					}
					return p;
				}),
			);
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
			const newColumn = await createColumnDb({
				name: name || `Column ${board.columns.length + 1}`,
				board: { connect: { id: board.id } },
				order: board.columns.length + 1,
			});

			if (!newColumn.data) {
				toast.error("Erro creating Column");
				return;
			}

			setBoard((prev) => ({
				...prev,
				columns: [...prev.columns, { ...newColumn.data, tasks: [] }],
			}));

			setProjects((prev) =>
				prev.map((p) => {
					if (p.id === board.id) {
						p.activities = [
							{
								id: uuid(),
								description: "Created",
								createdAt: new Date(),
								entityId: newColumn.data.id,
								type: "COLUMN",
								user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
							},
							...p.activities,
						];
					}
					return p;
				}),
			);
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
			await updateColumnDb(id, data);

			setBoard((prev) => {
				prev.columns[activeColumnIndex].name = data.name;
				prev.columns[activeColumnIndex].description = data.description;
				prev.columns[activeColumnIndex].taskStatus = data.taskStatus;

				return { ...prev };
			});

			setProjects((prev) =>
				prev.map((p) => {
					if (p.id === board.id) {
						p.activities = [
							{
								id: uuid(),
								description: "Updated",
								createdAt: new Date(),
								entityId: id,
								type: "COLUMN",
								user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
							},
							...p.activities,
						];
					}
					return p;
				}),
			);
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
			await deleteColumnDb(id);

			let called = false;
			setBoard((prev) => {
				if (called) return prev;
				called = true;

				prev.columns = prev.columns.filter((c) => c.id !== id);

				return prev;
			});

			setProjects((prev) =>
				prev.map((p) => {
					if (p.id === board.id) {
						p.activities = [
							{
								id: uuid(),
								description: "Deleted",
								createdAt: new Date(),
								entityId: id,
								type: "COLUMN",
								user: { id: currentUser.id, image: currentUser.image, name: currentUser.name },
							},
							...p.activities,
						];
					}
					return p;
				}),
			);
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
