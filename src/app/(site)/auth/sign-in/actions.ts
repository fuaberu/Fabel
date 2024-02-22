"use server";

import z from "zod";
import { db } from "@/lib/db";
import { LoginSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { createSession } from "@/auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
	if (!process.env.JWT_TOKEN_SECRET || !process.env.JWT_REFRESH_TOKEN_SECRET) {
		throw new Error("Missing environment auth secret");
	}

	const validatedFields = LoginSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields" };
	}

	const { email, password } = validatedFields.data;

	try {
		const user = await db.user.findUnique({ where: { email } });

		if (!user || !user.email || !user.password) {
			return { error: "Invalid Email or Password" };
		}

		const valid = await bcrypt.compare(password, user.password);

		if (!valid) {
			return { error: "Invalid Email or Password" };
		}

		// if (!user.emailVerified) {
		// 	await generateVerificationToken(user.email);

		// 	// await sendVerificationEmail(verificationToken.email, verificationToken.token);

		// 	return { message: "Confirmation email sent!" };
		// }

		const subscription = await db.subscription.findFirst({
			where: { user: { id: user.id }, active: true },
			orderBy: { currentPeriodEndDate: "desc" },
		});

		console.log(subscription);

		await createSession({ user, subscription });

		return { success: "Logged in!" };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong. Please try again later" };
	}
};
