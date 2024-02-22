"use server";

import { auth, updateSession } from "@/auth";
import { db } from "@/lib/db";
import { UserGeneralSettingsSchema } from "@/schemas/account";
import { z } from "zod";

export const updateGeneralUserSettings = async (
	data: z.infer<typeof UserGeneralSettingsSchema>,
) => {
	const userSession = await auth();
	try {
		await db.user.update({
			where: {
				id: userSession.id,
			},
			data,
		});

		await updateSession({ user: { ...data } });

		return { success: "Account updated!" };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong. Please try again later" };
	}
};

export const updateUserImage = async (image: string) => {
	const userSession = await auth();
	try {
		await db.user.update({
			where: {
				id: userSession.id,
			},
			data: { image },
		});

		await updateSession({ user: { image } });

		return { success: "Account updated!" };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong. Please try again later" };
	}
};
