"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas/auth";
// import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const validatedFields = RegisterSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields" };
	}

	const { email, password, name } = validatedFields.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	const existingUser = await db.user.findUnique({ where: { email } });

	if (existingUser) {
		return { error: "Email already in use" };
	}

	await db.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			emailVerified: new Date(),
		},
	});

	// const verificationToken = await generateVerificationToken(email);

	// await sendVerificationEmail(
	//   verificationToken.email,
	//   verificationToken.token,
	// );

	return { success: "Account created!" };
	// return { success: "Confirmation email sent!" };
};
