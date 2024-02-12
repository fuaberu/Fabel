"use client";

import { FC, useState } from "react";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	isAfter,
	isBefore,
	isToday,
	isWithinInterval,
	startOfMonth,
} from "date-fns";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tag, Task } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { smallDateTime } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { BoardApp } from "./ClientPage";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
	board: BoardApp;
	defaultLayout: number[] | undefined;
}

const CalendarComponent: FC<Props> = ({ board, defaultLayout = [20, 80] }) => {
	const tasks = board.columns.flatMap((c) => c.tasks);

	const onLayout = (sizes: number[]) => {
		if (typeof window === "undefined") return;
		document.cookie = `calendar-layout:layout=${JSON.stringify(sizes)}`;
	};

	const [date, setDate] = useState(new Date());

	const firstDayOfMonth = startOfMonth(date);
	const lastDayOfMonth = endOfMonth(date);

	const daysInMonth = eachDayOfInterval({
		start: firstDayOfMonth,
		end: lastDayOfMonth,
	});

	const startingDayIndex = getDay(firstDayOfMonth);

	const tasksOfMonth = tasks.filter(
		(t) =>
			t.dueDate &&
			isWithinInterval(t.dueDate, {
				start: firstDayOfMonth,
				end: lastDayOfMonth,
			}),
	);

	const tasksByDate = tasksOfMonth.reduce(
		(acc: { [key: string]: (Task & { tags: Tag[] })[] }, task) => {
			if (!task.dueDate) return acc;

			const dateKey = format(task.dueDate, "yyyy-MM-dd");
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push(task);
			return acc;
		},
		{},
	);

	return (
		<ResizablePanelGroup direction="horizontal" onLayout={onLayout}>
			<ResizablePanel defaultSize={defaultLayout[0]}>
				<div className="flex h-full w-full flex-col gap-2 pr-2">
					<h3 className="text-center text-2xl font-semibold">Tasks</h3>
					<Separator />
					{tasksOfMonth.map((t) => (
						<Popover key={`t-${t.id}`}>
							<Button asChild variant="ghost" className="w-full">
								<PopoverTrigger key={t.id}>
									<span className="truncate">{t.name}</span>
								</PopoverTrigger>
							</Button>
							<PopoverContent side="right">
								{t.dueDate && (
									<span
										className={cn(
											"text-xs text-muted-foreground",
											t.dueDate < new Date()
												? "text-red-500"
												: t.dueDate.toDateString() === new Date().toDateString() &&
														"text-yellow-500",
										)}
									>
										{smallDateTime(t.dueDate)}
									</span>
								)}
								<p>{t.description}</p>
							</PopoverContent>
						</Popover>
					))}
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={defaultLayout[1]}>
				<div className="container mx-auto p-4">
					<div className="mb-4">
						<h2 className="text-center text-3xl font-semibold">{format(date, "MMMM yyyy")}</h2>
					</div>
					<div className="grid grid-cols-7 gap-1">
						{WEEKDAYS.map((day) => {
							return (
								<div key={day} className="text-center font-bold">
									{day}
								</div>
							);
						})}
						{Array.from({ length: startingDayIndex }).map((_, index) => {
							return <div key={`empty-${index}`} className="rounded-md border p-2 text-center" />;
						})}{" "}
						{daysInMonth.map((day, index) => {
							const dateKey = format(day, "yyyy-MM-dd");
							const todaystasks = tasksByDate[dateKey] || [];
							return (
								<div
									key={`d-${index}`}
									className={cn("relative h-20 rounded-md border p-2 text-center", {
										"bg-background": isToday(day),
									})}
								>
									<div className="absolute inset-0 z-[0] flex flex-col overflow-hidden rounded-md">
										{todaystasks.map((task) => {
											if (!task.dueDate) return null;
											return (
												<div
													key={task.id}
													className={cn("truncate border-b text-gray-900", {
														"bg-green-300": isAfter(task.dueDate, date),
														"bg-red-300": isBefore(task.dueDate, date),
													})}
												>
													{task.name}
												</div>
											);
										})}
									</div>
									<span className="absolute left-0 right-0">{format(day, "d")}</span>
								</div>
							);
						})}
					</div>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};

export default CalendarComponent;
