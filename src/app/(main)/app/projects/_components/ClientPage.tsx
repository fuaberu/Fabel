"use client";

import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoardInfoBar from "./BoardInfoBar";
import CalendarComponent from "./calendar/CalendarComponent";
import BoardComponent from "./board/BoardComponent";
import { Board, Column, ProjectPages, Tag, Task } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SettingsComponent from "./settings";

export type BoardApp = Board & { columns: (Column & { tasks: (Task & { tags: Tag[] })[] })[] };

interface Props {
	board: BoardApp;
}

const ClientPage: FC<Props> = ({ board }) => {
	const [boardState, setBoardState] = useState(board);

	return (
		<Tabs defaultValue={board.defaultPage} className="flex h-full w-full flex-col">
			<TabsList className="absolute left-0 top-0 z-20 h-20 justify-center rounded-none bg-transparent pl-2">
				<BoardInfoBar id={board.id} boards={[board]} />
				<TabsTrigger value={ProjectPages.BOARD}>Board</TabsTrigger>
				<TabsTrigger value={ProjectPages.CALENDAR}>Calendar</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value={ProjectPages.BOARD} className="mt-0 max-h-full flex-1">
				<BoardComponent board={boardState} setBoard={setBoardState} />
			</TabsContent>
			<TabsContent value={ProjectPages.CALENDAR} className="mt-0">
				<CalendarComponent board={boardState} />
			</TabsContent>
			<TabsContent value="settings" className="mt-0 max-h-full flex-1">
				<SettingsComponent board={board} />
			</TabsContent>
		</Tabs>
	);
};

export default ClientPage;
