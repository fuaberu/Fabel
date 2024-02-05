"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const saveActivityLogsNotification = async ({
	pathname,
	description,
}: {
	pathname: string;
	description: string;
}) => {
	const user = await auth();

	if (!user) {
		return { error: "Unauthorized" };
	}

	return await db.notification.create({
		data: {
			pathname,
			notification: description,
			user: { connect: { id: user.id } },
		},
	});
};
