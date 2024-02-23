"use client";

import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoardInfoBar from "./BoardInfoBar";
import CalendarComponent from "./calendar/CalendarComponent";
import { Board, Column, ProjectPages, Tag, Task } from "@prisma/client";
import SettingsComponent from "./settings";
import BoardComponent from "./board/BoardComponent";
import InfoBar from "@/components/global/InfoBar";
import { UserSession } from "@/auth";

export type BoardApp = Board & { columns: (Column & { tasks: (Task & { tags: Tag[] })[] })[] };

interface Props {
	board: BoardApp;
	user: UserSession;
}

const ClientPage: FC<Props> = ({ board, user }) => {
	const [boardState, setBoardState] = useState(board);

	return (
		<Tabs defaultValue={board.defaultPage} className="flex h-full w-full flex-col">
			<InfoBar>
				<BoardInfoBar id={board.id} boards={[board]} />
			</InfoBar>
			<TabsList className="flex justify-center rounded-none p-6 md:fixed md:left-1/2 md:top-3 md:-translate-x-1/2 md:bg-transparent md:p-0">
				<TabsTrigger value={ProjectPages.BOARD}>Board</TabsTrigger>
				<TabsTrigger value={ProjectPages.CALENDAR}>Calendar</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value={ProjectPages.BOARD} className="mt-0 max-h-full flex-1 overflow-auto p-2">
				<BoardComponent board={boardState} currentUser={user} setBoard={setBoardState} />
			</TabsContent>
			<TabsContent value={ProjectPages.CALENDAR} className="mt-0 overflow-auto">
				<CalendarComponent board={boardState} />
			</TabsContent>
			<TabsContent value="settings" className="mt-0 max-h-full flex-1 overflow-auto p-2">
				<SettingsComponent board={board} />
			</TabsContent>
		</Tabs>
	);
};

export default ClientPage;
