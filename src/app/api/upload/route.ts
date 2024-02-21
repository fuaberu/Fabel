import { auth } from "@/auth";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	await auth();

	const formData = await req.formData();

	if (formData.has("file")) {
		const file = formData.get("file");
		const path = formData.get("path") as string | null;

		if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

		if (!(file instanceof File))
			return NextResponse.json({ error: "Wrong file type" }, { status: 400 });

		if (
			!process.env.S3_ACCESS_KEY ||
			!process.env.S3_SECRET_ACCESS_KEY ||
			!process.env.S3_BUCKET ||
			!process.env.S3_REGION
		)
			return NextResponse.json({ error: "Error uploading file, try again later" }, { status: 400 });

		const s3Client = new S3Client({
			region: process.env.S3_REGION,
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY,
				secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			},
		});

		const randomId = crypto.randomUUID();
		const ext = file.name.split(".").pop();
		let key = (path ? path + "-" + randomId : randomId) + "." + ext;

		if (key[0] === "/") key = key.substring(1);

		let buffer = Buffer.from(await file.arrayBuffer());

		const bucketName = process.env.S3_BUCKET;

		try {
			await s3Client.send(
				new PutObjectCommand({
					Bucket: bucketName,
					Key: key,
					ACL: "public-read",
					Body: buffer,
					ContentType: file.type,
				}),
			);

			const link = `https://${bucketName}.s3.amazonaws.com/${key}`;

			return Response.json(link);
		} catch (error) {
			console.error(error);

			return NextResponse.json({ error }, { status: 500 });
		}
	}
}
