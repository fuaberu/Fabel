"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect as redirectNext } from "next/navigation";

export interface UserSession {
	id: string;
	name: string;
	email: string | null;
	active: boolean;
}

export interface UserRefreshSession {
	id: string;
}

export function auth(noRedirect: true): Promise<UserSession | null>;

export function auth(noRedirect?: false): Promise<UserSession | never>;

export async function auth(noRedirect?: boolean): Promise<UserSession | null> {
	if (!process.env.JWT_TOKEN_SECRET) {
		if (!noRedirect) {
			return redirectNext("/");
		} else {
			return null;
		}
	}

	const session = cookies().get("session");

	if (!session) {
		if (!noRedirect) {
			return redirectNext("/");
		} else {
			return null;
		}
	}

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
			if (!noRedirect) {
				return redirectNext("/");
			} else {
				return null;
			}
		}

		return {
			id: sessionData.payload.id,
			name: sessionData.payload.name,
			email: sessionData.payload.email || null,
			active: sessionData.payload.active,
		};
	} catch (err) {}

	if (!noRedirect) {
		return redirectNext("/");
	} else {
		return null;
	}
}

export const signOut = () => {
	cookies().delete("session");
	cookies().delete("refresh");
};
