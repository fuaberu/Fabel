"use client";

import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoardInfoBar from "./BoardInfoBar";
import CalendarComponent from "./CalendarComponent";
import BoardComponent from "./BoardComponent";
import { Board, Column, Tag, Task } from "@prisma/client";

export type BoardApp = Board & { columns: (Column & { tasks: (Task & { tags: Tag[] })[] })[] };

interface Props {
	board: BoardApp;
}

const ClientPage: FC<Props> = ({ board }) => {
	const [boardState, setBoardState] = useState(board);

	return (
		<Tabs defaultValue="view" className="flex h-full w-full flex-col">
			<TabsList className="absolute left-0 top-0 z-20 h-20 justify-center rounded-none bg-transparent pl-2">
				<BoardInfoBar id={board.id} boards={[board]} />
				<TabsTrigger value="view">Board</TabsTrigger>
				<TabsTrigger value="calendar">Calendar</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="view" className="mt-0 max-h-full flex-1">
				<BoardComponent board={boardState} setBoard={setBoardState} />
			</TabsContent>
			<TabsContent value="calendar" className="mt-0 flex flex-1 flex-col">
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
