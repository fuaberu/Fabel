import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Page = async () => {
	const session = await auth();

	if (!session) return redirect("/");

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
