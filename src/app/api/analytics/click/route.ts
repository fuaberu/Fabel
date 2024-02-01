import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	return Response.json(true);
}
