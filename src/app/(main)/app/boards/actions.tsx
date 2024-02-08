"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { saveActivityLogsNotification } from "../actions";

// Board
export const createBoardDb = async (data: Prisma.BoardCreateInput, pathname: string) => {
	const res = await db.board.create({ data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Board",
		});
	}

	return res;
};

// Column
export const createColumnDb = async (data: Prisma.ColumnCreateInput, pathname: string) => {
	const res = await db.column.create({ data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Column",
		});
	}

	return res;
};

export const updateColumnDb = async (
	id: string,
	data: Prisma.ColumnUpdateInput,
	pathname: string,
) => {
	const res = await db.column.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Update Column",
		});
	}

	return res;
};

export const deleteColumnDb = async (id: string, pathname: string) => {
	const res = await db.column.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete Column",
		});
	}

	return res;
};

export const updateOrderColumnDb = async (
	column_1: { id: string; order: number },
	column_2: { id: string; order: number },
) => {
	return db.$transaction([
		db.column.update({ where: { id: column_1.id }, data: { order: column_1.order } }),
		db.column.update({ where: { id: column_2.id }, data: { order: column_2.order } }),
	]);
};

// Task
export const createTaskDb = async (data: Prisma.TaskCreateInput, pathname: string) => {
	const res = await db.task.create({
		data,
		include: { tags: true },
	});

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Task",
		});
	}

	return res;
};

export const updateTaskDb = async (id: string, data: Prisma.TaskUpdateInput, pathname: string) => {
	const res = await db.task.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Edit Task",
		});
	}

	return res;
};

export const deleteTaskDb = async (id: string, pathname: string) => {
	const res = await db.task.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete Task",
		});
	}

	return res;
};

export const updateTaskPositionDb = async (
	{
		id,
		columnId,
		order,
	}: {
		id: string;
		columnId: string;
		order: number;
	},
	pathname: string,
) => {
	const tasks = await db.task.findMany({
		where: {
			columnId,
		},
		select: { id: true, columnId: true, order: true },
	});

	try {
		if (tasks.length === 0) {
			await db.task.update({
				where: { id },
				data: { order: 0, column: { connect: { id: columnId } } },
			});
		} else {
			const currentTaskIndex = tasks.findIndex((t) => t.id === id);

			if (currentTaskIndex > -1) {
				// The task already exists in the column
				if (tasks.length === 1) {
					// Only active task in the column
					return;
				}
				tasks[currentTaskIndex].order = order;
			} else {
				// add a new task to the array of tasks where already has on order and reorder it
				tasks.push({ id, columnId, order });
			}

			// Sort the array based on the order property
			const sortedTasks = tasks.toSorted((a, b) => {
				if (a.order === b.order) {
					return a.id === id ? -1 : 1;
				}
				return a.order - b.order;
			});

			const updates: any[] = [];

			sortedTasks.forEach((task, index) => {
				const data: Prisma.TaskUpdateInput = { order: index };

				if (task.id === id) {
					data.order = order;
					if (currentTaskIndex < 0) {
						// active task and it's not in the column
						data.column = { connect: { id: task.columnId } };
					}
				} else {
					if (task.order === index) return;
				}

				updates.push(
					db.task.update({
						where: { id: task.id },
						data,
					}),
				);
			});

			const res = await db.$transaction(updates);
		}
	} catch (error) {
		console.error(error);
		throw new Error("Someting went wrong");
	}

	saveActivityLogsNotification({
		pathname,
		description: "Update Task",
	});
};
