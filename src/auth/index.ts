"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface UserSession {
	id: string;
	name: string;
	email: string;
	active: string;
}

export const auth = (): null | UserSession => {
	const session = cookies().get("session");

	if (!session) return null;

	try {
		const verify = jwt.verify(session.value, process.env.JWT_TOKEN_SECRET as string);

		if (typeof verify === "string") return null;

		return {
			id: verify.id,
			name: verify.name,
			email: verify.email,
			active: verify.active,
		};
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const signOut = () => {
	cookies().delete("session");
};
