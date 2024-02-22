import { addMonths } from "date-fns";
import { errors, jwtVerify } from "jose";
import { NextFetchEvent, NextRequest, NextResponse, userAgent } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
	const { nextUrl, url, geo, headers } = request;

	let response = NextResponse.next();

	// Trial
	if (nextUrl.pathname === "/" && nextUrl.searchParams.get("trial")) {
		response.cookies.set("trial", "true", {
			httpOnly: true,
			secure: true,
			sameSite: true,
			path: "/",
			expires: addMonths(new Date(), 1),
		});
	}

	const session = request.cookies.get("session");
	const refresh = request.cookies.get("refresh");

	if (!session) {
		response.cookies.delete("refresh");
		return response;
	}

	if (!refresh) {
		return response;
	}

	try {
		await jwtVerify(session.value, new TextEncoder().encode(process.env.JWT_TOKEN_SECRET));
	} catch (err) {
		if (err instanceof errors.JWTExpired) {
			response = NextResponse.redirect(request.url);
			// Try to refresh token
			const newToken = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/api/auth/refresh", {
				method: "POST",
				body: JSON.stringify({ session: session.value, refresh: refresh.value }),
			}).then(async (res) => await res.text());

			if (newToken) {
				response.cookies.set("session", newToken, {
					httpOnly: true,
					secure: true,
					sameSite: true,
					path: "/",
				});
			} else {
				response.cookies.delete("session");
				response.cookies.delete("refresh");
			}
		}
	}

	return response;
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
