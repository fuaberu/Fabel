"use client";

import { FC, useMemo, useState } from "react";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	isAfter,
	isBefore,
	isPast,
	isToday,
	isWithinInterval,
	lastDayOfWeek,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { Tag, Task, TaskStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { BoardApp } from "./ClientPage";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
	board: BoardApp;
}

const CalendarComponent: FC<Props> = ({ board }) => {
	const [date, setDate] = useState(new Date());

	const monthFirstDate = startOfMonth(date);
	const monthLastDate = endOfMonth(date);

	const monthFirstWeekdayDate = startOfWeek(monthFirstDate);
	const monthLastWeekdayDate = lastDayOfWeek(monthLastDate);

	const daysInMonth = eachDayOfInterval({
		start: monthFirstWeekdayDate,
		end: monthLastWeekdayDate,
	});

	const tasksByDate = useMemo(
		() =>
			board.columns.reduce(
				(acc: { [key: string]: (Task & { tags: Tag[]; status: TaskStatus })[] }, column) => {
					column.tasks.forEach((task) => {
						if (
							!task.dueDate ||
							!isWithinInterval(task.dueDate, {
								start: monthFirstWeekdayDate,
								end: monthLastWeekdayDate,
							})
						) {
							return;
						}

						const dateKey = format(task.dueDate, "yyyy-MM-dd");

						if (!acc[dateKey]) {
							acc[dateKey] = [];
						}

						acc[dateKey].push({ ...task, status: column.taskStatus });
					});

					return acc;
				},
				{},
			),
		[board.columns, date],
	);

	return (
		<div className="mx-auto flex h-full w-full flex-col">
			<div className="mb-4 flex items-center justify-center gap-3">
				<Button
					variant="ghost"
					type="button"
					onClick={() => setDate((prevDate) => subMonths(prevDate, 1))}
				>
					<ChevronLeft />
				</Button>
				<h2 className="text-center text-3xl font-semibold">{format(date, "MMMM yyyy")}</h2>
				<Button
					variant="ghost"
					type="button"
					onClick={() => setDate((prevDate) => addMonths(prevDate, 1))}
				>
					<ChevronRight />
				</Button>
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
			<div
				className={cn("grid flex-1 grid-cols-7", {
					"grid-rows-4": daysInMonth.length === 28,
					"grid-rows-5": daysInMonth.length === 35,
					"grid-rows-6": daysInMonth.length === 42,
				})}
			>
				{daysInMonth.map((day, index) => {
					const dateKey = format(day, "yyyy-MM-dd");
					const todaystasks = tasksByDate[dateKey] || [];
					return (
						<div
							key={`d-${index}`}
							className={cn("relative flex h-full flex-col border p-2 text-center", {
								"bg-background": isToday(day),
							})}
						>
							<span className="block text-left text-lg font-semibold">{format(day, "d")}</span>
							<div className="flex flex-1 flex-col gap-1 overflow-hidden rounded-b-md">
								{todaystasks.map((task, i) => {
									if (!task.dueDate) return null;
									if (todaystasks.length > 3 && i >= 3) return null;
									if (todaystasks.length > 3 && i === 2)
										return (
											<div className="flex h-1/3 items-center justify-start gap-1 rounded-md bg-accent p-1 text-sm">
												<Plus size={15} />
												<span>{todaystasks.length - 2} Tasks</span>
											</div>
										);
									return (
										<HoverCard key={task.id}>
											<HoverCardTrigger
												className={cn(
													"flex h-1/3 items-center justify-start gap-2 rounded-md bg-accent p-1 text-sm",
												)}
											>
												{task.status !== "DONE" && isPast(task.dueDate) && (
													<div>
														<span className="block h-[8px] w-[8px] rounded-full bg-red-500" />
													</div>
												)}
												{task.status === "DONE" && (
													<div>
														<span className="h-2 w-2 rounded-full bg-emerald-500" />
													</div>
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
