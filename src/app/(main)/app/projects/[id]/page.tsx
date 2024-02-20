import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientPage from "../_components/ClientPage";

const Page = async ({ params }: { params: { id: string } }) => {
	const user = await auth();

	if (!user) {
		return redirect(`/`);
	}

	const board = await db.board.findFirst({
		where: { id: params.id, users: { some: { userId: user.id } } },
		include: { columns: { include: { tasks: { include: { tags: true } } } } },
	});

	if (!board) return redirect(`/app/board`);

	// Sort board data
	board.columns
		.sort((a, b) => a.order - b.order)
		.map((c) =>
			c.tasks.sort((a, b) => {
				return a.order - b.order;
			}),
		);

	return <ClientPage board={board} />;
};

export default Page;
