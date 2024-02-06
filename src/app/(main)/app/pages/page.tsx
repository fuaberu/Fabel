import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const Page = async () => {
	const session = await auth();

	if (!session) return redirect("/");

	const test = await db.task.findUnique({ where: { id: "119560fb-cc4a-4be9-a907-8f17802869c2" } });

	return <div>{test?.dueDate?.toISOString().slice(0, 19)}</div>;

	return (
		<div className="flex flex-wrap gap-4">
			{/* {boards.map((board) => (
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
				))} */}
			{/* <BoardForm userId={session.id} /> */}
			<div>will have pages here</div>
		</div>
	);
};

export default Page;
