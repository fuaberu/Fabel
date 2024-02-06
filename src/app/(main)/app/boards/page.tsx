import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { ArrowUpRightFromSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import BoardForm from "./_components/forms/BoardForm";

const Page = async () => {
	const session = await auth();

	if (!session) return redirect("/");

	const boards = await db.board.findMany({
		where: { userId: session.id },
		orderBy: { updatedAt: "desc" },
	});

	if (boards.length > 0)
		return (
			<div className="flex flex-wrap gap-4">
				{boards.map((board) => (
					<Link
						key={board.id}
						href={`/app/boards/${board.id}`}
						className="rounded-md duration-200 hover:scale-[1.02] hover:ring-2"
					>
						<Card className="h-44 w-80 bg-card/60">
							<CardHeader>
								<CardTitle>{board.name}</CardTitle>
							</CardHeader>
							<CardContent className="flex justify-center gap-2">
								Open <ArrowUpRightFromSquare />
							</CardContent>
						</Card>
					</Link>
				))}
				<BoardForm userId={session.id} />
			</div>
		);

	let destination = "/app";
	try {
		const newBoard = await db.board.create({
			data: { name: "First Board", user: { connect: { id: session.id } } },
		});

		destination = `/app/boards/${newBoard.id}`;
	} catch (error) {
		console.error(error);
	} finally {
		redirect(destination);
	}
};

export default Page;
