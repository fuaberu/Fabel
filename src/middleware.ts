import { NextRequest, NextResponse, userAgent } from "next/server";

export async function middleware(request: NextRequest) {
	const { nextUrl, url, geo } = request;

	//if subdomain exists
	const customSubDomain = request.headers
		.get("host")
		?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
		.filter(Boolean)[0];

	if (customSubDomain) {
		//rewrite for domains
		const searchParams = nextUrl.searchParams.toString();

		const pathWithSearchParams = `${nextUrl.pathname}${
			searchParams.length > 0 ? `?${searchParams}` : ""
		}`;
		// Save register
		// const user = userAgent(request);

		// const segments = nextUrl.pathname.split("/");
		// const slug = segments.pop() || segments.pop();

		// // Create event
		// fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics/view`, {
		// 	method: "POST",
		// 	body: JSON.stringify({
		// 		page: { connect: { slug } },
		// 		originCity: geo?.city || "",
		// 		originCountry: geo?.country || "",
		// 		browser: user.browser.name || "",
		// 		browserVersion: user.browser.version || "",
		// 		deviceModel: user.device.model || "",
		// 		deviceType: user.device.type || "",
		// 		deviceVendor: user.device.vendor || "",
		// 		isBot: user.isBot,
		// 	}),
		// });
		return NextResponse.rewrite(
			new URL(`/${customSubDomain}${pathWithSearchParams}`, nextUrl.origin),
		);
	}
	if (
		nextUrl.pathname === "/" ||
		(nextUrl.pathname === "/site" && nextUrl.host === process.env.NEXT_PUBLIC_DOMAIN)
	) {
		return NextResponse.rewrite(new URL("/site", url));
	}

	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
