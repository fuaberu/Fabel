import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BoardInfoBar from "../_components/BoardInfoBar";
import BoardView from "../_components/BoardView";
import { TooltipProvider } from "@/components/ui/tooltip";

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

	const tasks = board.columns
		.map((c) => c.tasks.flat())
		.flat()
		.sort((a, b) => {
			if (a.order === b.order) {
				// sort by date updated
				return (
					(b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime()) -
					(a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime())
				);
			}

			return a.order - b.order;
		});

	const columns = board.columns.sort((a, b) => a.order - b.order);

	const boards = await db.board.findMany({
		where: { user: { id: user.id } },
	});

	return (
		<Tabs defaultValue="view" className="flex h-full w-full flex-col">
			<TabsList className="h-12 w-full justify-between rounded-none border-b-2 bg-transparent p-1">
				<BoardInfoBar id={board.id} boards={boards} />
				<div>
					<TabsTrigger value="view">Board</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</div>
			</TabsList>
			<TabsContent value="view" className="flex-1">
				<BoardView board={board} defaultColumns={columns} defaultTasks={tasks} />
			</TabsContent>
			<TabsContent value="settings" className="flex-1 overflow-hidden">
				<div className="h-full w-full bg-green-300"></div>
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
