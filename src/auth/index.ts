"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect as redirectNext } from "next/navigation";
import { Subscription, Tier, User } from "@prisma/client";
import { z } from "zod";

export interface UserSession {
	id: string;
	name: string;
	email: string | null;
	image: string | null;
	subscription: {
		active: boolean;
		tier: Tier;
		currentPeriodEndDate: number | null;
	} | null;
}

const UserSessionSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().nullish(),
	image: z.string().nullish(),
	subscription: z.object({
		active: z.boolean(),
		tier: z.nativeEnum(Tier),
		currentPeriodEndDate: z.number().nullable(),
	}),
});

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

		const validatedSession = UserSessionSchema.safeParse(sessionData.payload);

		if (!validatedSession.success) {
			if (!noRedirect) {
				return redirectNext("/");
			} else {
				return null;
			}
		}

		return {
			id: validatedSession.data.id,
			name: validatedSession.data.name,
			email: validatedSession.data.email || null,
			image: validatedSession.data.image || null,
			subscription: {
				active: validatedSession.data.subscription.active,
				tier: validatedSession.data.subscription.tier,
				currentPeriodEndDate: validatedSession.data.subscription.currentPeriodEndDate,
			},
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

export const createSession = async ({
	user,
	subscription,
}: {
	user: User;
	subscription: Subscription | null;
}) => {
	const tokenData = {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image,
		subscription: subscription
			? {
					active: subscription.active,
					tier: subscription.tier,
					currentPeriodEndDate: subscription.currentPeriodEndDate?.getTime() || null,
				}
			: null,
	} satisfies UserSession;

	//	Clean cookies
	cleanCookies();

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
};

export const updateSession = async ({
	user,
	subscription,
}: {
	user?: Partial<User>;
	subscription?: Partial<Subscription> | null;
}) => {
	const currentSession = await auth();

	const tokenData = {
		...currentSession,
		...user,
		...subscription,
	} satisfies Partial<UserSession>;

	//	Clean cookies
	cleanCookies();

	const session = await new SignJWT(tokenData)
		.setProtectedHeader({ alg: "HS256" })
		.setProtectedHeader({ typ: "JWT", alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1d")
		.sign(new TextEncoder().encode(process.env.JWT_TOKEN_SECRET));

	cookies().set("session", session, { httpOnly: true, secure: true, sameSite: true, path: "/" });
};

const cleanCookies = () => {
	cookies().delete("trial");
};
