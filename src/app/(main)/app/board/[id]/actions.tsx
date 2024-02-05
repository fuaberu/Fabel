"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { saveActivityLogsNotification } from "../../actions";

// Column
export const createColumnDb = async (data: Prisma.ColumnCreateInput, pathname: string) => {
	const res = await db.column.create({ data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create a Column",
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
			description: "Update a Column",
		});
	}

	return res;
};

export const deleteColumnDb = async (id: string, pathname: string) => {
	const res = await db.column.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete a Column",
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
	const res = await db.task.create({ data, include: { tags: true } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Edit a Task",
		});
	}

	return res;
};

export const updateTaskDb = async (id: string, data: Prisma.TaskUpdateInput, pathname: string) => {
	const res = await db.task.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Edit a Task",
		});
	}

	return res;
};

export const deleteTaskDb = async (id: string, pathname: string) => {
	const res = await db.task.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete a Task",
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
	const res = await db.$transaction(async (tx) => {
		// 1. Decrement amount from the sender.
		const tasks = await tx.task.findMany({
			where: {
				columnId,
			},
		});

		if (tasks.length == 0) {
			return tx.task.update({
				where: { id },
				data: { order, column: { connect: { id: columnId } } },
			});
		}

		const updatdTask = await tx.task.update({
			where: { id },
			data: { order, column: { connect: { id: columnId } } },
		});

		const updatedTaskIndex = tasks.findIndex((t) => t.id === id);
		// create the new task
		if (updatedTaskIndex > -1) {
			// The task already exists in the column
			tasks[updatedTaskIndex] = updatdTask;
		} else {
			// add a new task to the array of tasks where already has on order and reorder it
			tasks.push(updatdTask);
		}

		// Sort the array based on the order property
		tasks.sort((a, b) => a.order - b.order);

		// Update the necessary tasks in the database
		for (let i = 0; i < tasks.length; i++) {
			if (tasks[i].order !== i) {
				await tx.task.update({
					where: { id: tasks[i].id },
					data: { order: i },
				});
			}
		}

		return updatdTask;
	});

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Update Task Position",
		});
	}

	return res;
};
