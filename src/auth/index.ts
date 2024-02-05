"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface UserSession {
	id: string;
	name: string;
	email: string | null;
	active: boolean;
}

export interface UserRefreshSession {
	id: string;
}

export const auth = async (): Promise<null | UserSession> => {
	if (!process.env.JWT_TOKEN_SECRET) {
		throw new Error("Missing environment token secret");
	}

	const session = cookies().get("session");

	if (!session) return null;

	try {
		const sessionData = await jwtVerify(
			session.value,
			new TextEncoder().encode(process.env.JWT_TOKEN_SECRET),
		);

		if (
			typeof sessionData.payload.id !== "string" ||
			typeof sessionData.payload.name !== "string" ||
			(typeof sessionData.payload.email !== "string" && sessionData.payload.email !== null) ||
			typeof sessionData.payload.active !== "boolean"
		) {
			return null;
		}

		return {
			id: sessionData.payload.id,
			name: sessionData.payload.name,
			email: sessionData.payload.email || null,
			active: sessionData.payload.active,
		};
	} catch (err) {}

	return null;
};

export const signOut = () => {
	cookies().delete("session");
	cookies().delete("refresh");
};
