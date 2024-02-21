"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { LoginSchema } from "@/schemas/auth";
import { generateVerificationToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

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

		if (!user.emailVerified) {
			await generateVerificationToken(user.email);

			// await sendVerificationEmail(verificationToken.email, verificationToken.token);

			return { message: "Confirmation email sent!" };
		}

		const tokenData = {
			id: user.id,
			name: user.name,
			email: user.email,
			active: user.active,
		};

		const session = await new SignJWT(tokenData)
			.setProtectedHeader({ alg: "HS256" })
			.setProtectedHeader({ typ: "JWT", alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("1d")
			.sign(new TextEncoder().encode(process.env.JWT_TOKEN_SECRET));

		cookies().set("session", session, { httpOnly: true, secure: true, sameSite: true, path: "/" });

		const refreshData = { id: user.id };

		const refresh = await new SignJWT(refreshData)
			.setProtectedHeader({ alg: "HS256" })
			.setProtectedHeader({ typ: "JWT", alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("30d")
			.sign(new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET));

		cookies().set("refresh", refresh, { httpOnly: true, secure: true, sameSite: true, path: "/" });

		return { success: "Logged in!" };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong. Please try again later" };
	}
};
