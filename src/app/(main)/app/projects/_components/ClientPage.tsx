"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoardInfoBar from "./BoardInfoBar";
import CalendarComponent from "./CalendarComponent";
import BoardComponent from "./Board";
import { Board, Column, Tag, Task } from "@prisma/client";
import { FC, useState } from "react";

export type BoardApp = Board & { columns: (Column & { tasks: (Task & { tags: Tag[] })[] })[] };

interface Props {
	defaultCalendarLayout: number[];
	board: BoardApp;
}

const ClientPage: FC<Props> = ({ board, defaultCalendarLayout }) => {
	const [boardState, setBoardState] = useState(board);

	return (
		<Tabs defaultValue="view" className="flex h-full w-full flex-col">
			<TabsList className="h-12 w-full justify-between rounded-none border-b-2 bg-transparent p-1">
				<BoardInfoBar id={board.id} boards={[]} />
				<div>
					<TabsTrigger value="view">Board</TabsTrigger>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</div>
			</TabsList>
			<TabsContent value="view" className="flex-1">
				<BoardComponent board={boardState} setBoard={setBoardState} />
			</TabsContent>
			<TabsContent value="calendar" className="flex-1">
				<CalendarComponent board={boardState} defaultLayout={defaultCalendarLayout} />
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
