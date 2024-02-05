import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JWTPayload, SignJWT, errors, jwtVerify } from "jose";
import { z } from "zod";

const RefreshSchema = z.object({
	session: z.string(),
	refresh: z.string(),
});

export async function POST(request: NextRequest) {
	if (!process.env.JWT_TOKEN_SECRET) {
		throw new Error("Missing environment token secret");
	}
	if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
		throw new Error("Missing environment refresh token secret");
	}

	const data = await request.json();

	const validatedFields = RefreshSchema.safeParse(data);

	if (!validatedFields.success) {
		return new NextResponse(JSON.stringify(null), {
			status: 400,
		});
	}

	const { refresh, session } = validatedFields.data;

	try {
		await jwtVerify(session, new TextEncoder().encode(process.env.JWT_TOKEN_SECRET));
	} catch (error) {
		if (error instanceof errors.JWTExpired) {
			// Try to refresh token
			try {
				const refreshData = await jwtVerify(
					refresh,
					new TextEncoder().encode(process.env.JWT_REFRESH_TOKEN_SECRET),
				);

				if (typeof refreshData.payload.id === "string") {
					const user = await db.user.findUnique({ where: { id: refreshData.payload.id } });

					if (user && user.active) {
						const tokenData: JWTPayload = {
							id: user.id,
							name: user.name,
							email: user.email,
							active: user.active,
						};

						const session = await new SignJWT(tokenData)
							.setProtectedHeader({ alg: "HS256" })
							.setProtectedHeader({ typ: "JWT", alg: "HS256" })
							.setIssuedAt()
							.setExpirationTime("1h")
							.sign(new TextEncoder().encode(process.env.JWT_TOKEN_SECRET));

						return new NextResponse(session, {
							status: 400,
						});
					}
				}
			} catch (error) {
				console.error(error);
			}
		}
	}
}
