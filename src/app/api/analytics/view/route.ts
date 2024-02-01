import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
	const viewSchema = z.object({
		page: z.object({ connect: z.object({ slug: z.string() }) }),
		originCity: z.string().optional(),
		originCountry: z.string().optional(),
		browser: z.string().optional(),
		browserVersion: z.string().optional(),
		deviceModel: z.string().optional(),
		deviceType: z.string().optional(),
		deviceVendor: z.string().optional(),
		isBot: z.boolean(),
	});

	const data = viewSchema.safeParse(await req.json());

	if (!data.success) {
		return Response.json(false);
	}

	// await db.viewEvent.create({
	// 	data: {
	// 		...data.data
	// 	}
	// });

	return Response.json(false);
}
