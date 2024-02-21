import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { ArrowUpRightFromSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
	const session = await auth();

	const pages = await db.page.findMany({
		where: { userId: session.id },
		orderBy: { updatedAt: "desc" },
	});

	if (pages.length > 0)
		return (
			<div className="flex flex-wrap gap-4">
				{pages.map((page) => (
					<Link
						key={page.id}
						href={`/app/pages/${page.id}`}
						className="rounded-md ring-primary duration-200 hover:scale-[1.02] hover:ring-2"
					>
						<Card className="h-44 w-80 bg-card/60">
							<CardHeader>
								<CardTitle>{page.name}</CardTitle>
							</CardHeader>
							<CardContent className="flex justify-center gap-2">
								Open <ArrowUpRightFromSquare />
							</CardContent>
						</Card>
					</Link>
				))}

				{/* <PageForm userId={session.id} /> */}
			</div>
		);

	let destination = "/app";
	try {
		const newpage = await db.page.create({
			data: { name: "First page", user: { connect: { id: session.id } } },
		});

		destination = `/app/pages/${newpage.id}`;
	} catch (error) {
		console.error(error);
	} finally {
		redirect(destination);
	}
};

export default Page;
