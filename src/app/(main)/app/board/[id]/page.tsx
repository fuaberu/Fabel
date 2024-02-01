import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BoardInfoBar from "./_components/BoardInfoBar";

const Page = async ({ params }: { params: { id: string } }) => {
	const user = auth();

	if (!user) {
		return redirect(`/`);
	}

	const board = await db.board.findFirst({
		where: { id: params.id, user: { id: user.id } },
		include: { columns: true },
	});

	if (!board) return redirect(`/app/board`);

	const boards = await db.board.findMany({
		where: { user: { id: user.id } },
	});

	return (
		<Tabs defaultValue="view" className="w-full">
			<TabsList className="mb-4 h-16 w-full justify-between border-b-2 bg-transparent">
				<BoardInfoBar id={board.id} boards={boards} />
				<div>
					<TabsTrigger value="view">Pipeline View</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</div>
			</TabsList>
			<TabsContent value="view">
				{/* <BoardView
					lanes={lanes}
					pipelineDetails={pipelineDetails}
					pipelineId={params.pipelineId}
					subaccountId={params.subaccountId}
					updateLanesOrder={updateLanesOrder}
					updateTicketsOrder={updateTicketsOrder}
				/> */}
			</TabsContent>
			<TabsContent value="settings">
				settings
				{/* <BoardSettings
					pipelineId={params.pipelineId}
					pipelines={pipelines}
					subaccountId={params.subaccountId}
				/> */}
			</TabsContent>
		</Tabs>
	);
};

export default Page;
