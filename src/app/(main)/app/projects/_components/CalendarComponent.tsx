"use client";

import { FC, useState } from "react";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	isAfter,
	isBefore,
	isToday,
	isWithinInterval,
	lastDayOfWeek,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { Tag, Task } from "@prisma/client";
import { cn } from "@/lib/utils";
import { BoardApp } from "./ClientPage";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarDays } from "lucide-react";

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

	const monthFirstDate = startOfMonth(date);
	const monthLastDate = endOfMonth(date);

	const monthFirstWeekdayDate = startOfWeek(monthFirstDate);
	const monthLastWeekdayDate = lastDayOfWeek(monthLastDate);

	const daysInMonth = eachDayOfInterval({
		start: monthFirstWeekdayDate,
		end: monthLastWeekdayDate,
	});

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
		<div className="mx-auto flex h-full w-full flex-col">
			<div className="mb-4">
				<h2 className="text-center text-3xl font-semibold">{format(date, "MMMM yyyy")}</h2>
			</div>
			<div className="grid grid-cols-7">
				{WEEKDAYS.map((day) => {
					return (
						<div key={day} className="text-center font-bold">
							{day}
						</div>
					);
				})}
			</div>
			<div className="grid flex-1 grid-cols-7 grid-rows-5">
				{daysInMonth.map((day, index) => {
					const dateKey = format(day, "yyyy-MM-dd");
					const todaystasks = tasksByDate[dateKey] || [];
					return (
						<div
							key={`d-${index}`}
							className={cn("relative h-full border p-2 text-center", {
								"bg-background": isToday(day),
							})}
						>
							<span className="block text-left text-lg font-semibold">{format(day, "d")}</span>
							<div className="flex flex-col gap-1 overflow-hidden rounded-b-md">
								{todaystasks.map((task) => {
									if (!task.dueDate) return null;
									return (
										<HoverCard key={task.id}>
											<HoverCardTrigger
												className={cn(
													"flex items-center justify-start gap-2 rounded-md bg-accent p-1 text-sm",
												)}
											>
												{isBefore(task.dueDate, date) && (
													<span className="h-2 w-2 rounded-full bg-red-500" />
												)}
												<span className="truncate">{task.name}</span>
											</HoverCardTrigger>
											<HoverCardContent className="space-y-1">
												<h4 className="text-sm font-semibold">{task.name}</h4>
												<p className="text-sm">{task.description}</p>
												<div className="flex items-center pt-2">
													<CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
													<span className="text-xs text-muted-foreground">
														{format(task.dueDate, "MMMM dd, yyyy")}
													</span>
												</div>
											</HoverCardContent>
										</HoverCard>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CalendarComponent;
