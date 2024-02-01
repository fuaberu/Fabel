"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { LoginSchema } from "@/schemas/auth";
import { generateVerificationToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserSession } from "@/auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
	const validatedFields = LoginSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields" };
	}

	const { email, password } = validatedFields.data;

	try {
		const existingUser = await db.user.findUnique({ where: { email } });

		if (!existingUser || !existingUser.email || !existingUser.password) {
			return { error: "Invalid Email or Password" };
		}

		if (!existingUser.emailVerified) {
			await generateVerificationToken(existingUser.email);

			// await sendVerificationEmail(verificationToken.email, verificationToken.token);

			return { message: "Confirmation email sent!" };
		}

		const valid = await bcrypt.compare(password, existingUser.password);

		if (!valid) {
			return { error: "Invalid Email or Password" };
		}

		const tokenData: UserSession = {
			id: existingUser.id,
			name: existingUser.name,
			email: existingUser.email,
			active: existingUser.active,
		};

		const session = jwt.sign(tokenData, process.env.JWT_TOKEN_SECRET as string, {
			expiresIn: "1d",
		});

		cookies().set("session", session, { httpOnly: true, secure: true, sameSite: true });

		return { success: "Logged in!" };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong. Please try again later" };
	}
};
