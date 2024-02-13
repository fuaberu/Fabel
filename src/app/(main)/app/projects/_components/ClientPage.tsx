"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoardInfoBar from "./BoardInfoBar";
import CalendarComponent from "./CalendarComponent";
import BoardComponent from "./Board";
import { Board, Column, Tag, Task } from "@prisma/client";
import { FC, useState } from "react";

export type BoardApp = Board & { columns: (Column & { tasks: (Task & { tags: Tag[] })[] })[] };

interface Props {
	board: BoardApp;
}

const ClientPage: FC<Props> = ({ board }) => {
	const [boardState, setBoardState] = useState(board);

	return (
		<Tabs defaultValue="view" className="flex h-full w-full flex-col">
			<TabsList className="absolute top-0 z-20 h-20 w-full justify-center rounded-none bg-transparent p-1">
				<div className="absolute left-0 top-0 flex h-20 flex-col items-center justify-center">
					<BoardInfoBar id={board.id} boards={[]} />
				</div>
				<TabsTrigger value="view">Board</TabsTrigger>
				<TabsTrigger value="calendar">Calendar</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="view" className="flex-1">
				<BoardComponent board={boardState} setBoard={setBoardState} />
			</TabsContent>
			<TabsContent value="calendar" className="flex-1">
				<CalendarComponent board={boardState} />
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

export default ClientPage;
