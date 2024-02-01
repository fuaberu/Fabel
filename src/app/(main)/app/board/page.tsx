import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type Props = {
	params: { subaccountId: string };
};

const Page = async ({ params }: Props) => {
	const session = auth();

	if (!session) return redirect("/");

	const boardExists = await db.board.findFirst({
		where: { userId: session.id },
		orderBy: { updatedAt: "desc" },
	});

	if (boardExists) return redirect(`/app/board/${boardExists.id}`);

	try {
		const newBoard = await db.board.create({
			data: { name: "First Board", user: { connect: { id: session.id } } },
		});

		return redirect(`/app/board/${newBoard.id}`);
	} catch (error) {
		console.error(error);
		return redirect(`/app`);
	}
};

export default Page;
