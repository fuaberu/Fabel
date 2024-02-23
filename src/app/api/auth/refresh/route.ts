import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { z } from "zod";
import { UserSession, signSessionPayload } from "@/auth";

const RefreshSchema = z.string();

export async function GET(request: NextRequest) {
	if (!process.env.JWT_TOKEN_SECRET) {
		throw new Error("Missing environment token secret");
	}
	if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
		throw new Error("Missing environment refresh token secret");
	}

	const token = request.nextUrl.searchParams.get("token");

	const validatedFields = RefreshSchema.safeParse(token);

	if (!validatedFields.success) {
		return new NextResponse(JSON.stringify(null), {
			status: 400,
		});
	}

	const refreshToken = validatedFields.data;

	try {
		const refreshData = await jwtVerify(
			refreshToken,
			new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET),
		);

		if (typeof refreshData.payload.id === "string") {
			const user = await db.user.findUnique({ where: { id: refreshData.payload.id } });

			const subscription = await db.subscription.findFirst({
				where: { user: { id: refreshData.payload.id }, active: true },
				orderBy: { currentPeriodEndDate: "desc" },
			});

			if (user && user.active) {
				// Create new session object
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

				// Sign new session
				const signSession = await signSessionPayload(tokenData);

				// Return new session signed token
				return new NextResponse(signSession, {
					status: 200,
				});
			}
		}
	} catch (error) {
		console.error(error);
	}

	return new NextResponse(JSON.stringify(null), {
		status: 400,
	});
}
