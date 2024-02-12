import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ClientPage from "../_components/ClientPage";

const Page = async ({ params }: { params: { id: string } }) => {
	const user = await auth();

	if (!user) {
		return redirect(`/`);
	}

	const board = await db.board.findFirst({
		where: { id: params.id, user: { id: user.id } },
		include: { columns: { include: { tasks: { include: { tags: true } } } } },
	});

	if (!board) return redirect(`/app/board`);

	// Sort board data
	board.columns
		.sort((a, b) => a.order - b.order)
		.map((c) =>
			c.tasks.sort((a, b) => {
				if (a.order === b.order) {
					return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0);
				}
				return a.order - b.order;
			}),
		);

	const layout = cookies().get("calendar-layout:layout");

	let defaultCalendarLayout = [20, 80];
	if (layout) {
		defaultCalendarLayout = JSON.parse(layout.value);
	}

	return <ClientPage board={board} defaultCalendarLayout={defaultCalendarLayout} />;
};

export default Page;
