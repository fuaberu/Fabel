"use client";

import { FC, useMemo, useRef, useState } from "react";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	intlFormat,
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
import { BoardApp } from "../ClientPage";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarDays, CheckCheck, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

	const daysInMonth = useMemo(
		() =>
			eachDayOfInterval({
				start: monthFirstWeekdayDate,
				end: monthLastWeekdayDate,
			}),
		[monthLastWeekdayDate, monthFirstWeekdayDate],
	);

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
		[board.columns, monthFirstWeekdayDate, monthLastWeekdayDate],
	);

	const topRef = useRef<HTMLDivElement>(null);

	return (
		<>
			<div ref={topRef} />
			<div className="mx-auto flex h-full w-full flex-col pb-2 pt-[calc(theme(spacing.20)-theme(spacing.2))]">
				<div className="fixed left-1/2 top-[calc(theme(spacing.20)-theme(spacing.2))] z-10 flex -translate-x-1/2 items-center justify-center gap-3 rounded-md border bg-opacity-20 bg-clip-padding px-4 py-2 backdrop-blur-sm backdrop-filter">
					<Button
						variant="ghost"
						type="button"
						onClick={() => {
							setDate((prevDate) => subMonths(prevDate, 1));
							topRef.current?.scrollIntoView({
								behavior: "smooth",
								block: "end",
								inline: "nearest",
							});
						}}
					>
						<ChevronLeft />
					</Button>
					<h2 className="text-md text-center font-semibold md:text-3xl">
						{format(date, "MMMM yyyy")}
					</h2>
					<Button
						variant="ghost"
						type="button"
						onClick={() => {
							setDate((prevDate) => addMonths(prevDate, 1));
							topRef.current?.scrollIntoView({
								behavior: "smooth",
								block: "end",
								inline: "nearest",
							});
						}}
					>
						<ChevronRight />
					</Button>
				</div>
				<div className="grid grid-cols-7">
					{WEEKDAYS.map((day) => {
						return (
							<div key={day} className="text-center font-bold">
								<span>{day[0].toUpperCase()}</span>
								<span className="hidden md:inline">{day.slice(1)}</span>
							</div>
						);
					})}
				</div>
				<div
					className={cn("grid max-h-full flex-1 grid-cols-7", {
						"grid-rows-4": daysInMonth.length === 28,
						"grid-rows-5": daysInMonth.length === 35,
						"grid-rows-6": daysInMonth.length === 42,
					})}
				>
					{daysInMonth.map((day, index) => {
						const dateKey = format(day, "yyyy-MM-dd");
						const todaystasks = tasksByDate[dateKey] || [];
						return (
							<AspectRatio ratio={1} key={`d-${index}`}>
								<div
									className={cn("relative flex h-full flex-col border p-1 text-center md:p-2", {
										"bg-background": isToday(day),
									})}
								>
									<span className="block text-left text-sm font-semibold md:text-lg">
										{format(day, "d")}
									</span>
									<div className="flex flex-1 flex-col gap-1 overflow-hidden rounded-b-md">
										{todaystasks.map((task, i) => {
											if (!task.dueDate) return null;
											if (todaystasks.length > 4 && i >= 4) return null;
											if (todaystasks.length > 4 && i === 3)
												return (
													<div
														key={task.id}
														className="flex h-1/4 items-center justify-start gap-1 rounded-md bg-muted-foreground p-1 px-2 text-sm text-white shadow dark:bg-accent"
													>
														<Plus size={15} />
														<span>{todaystasks.length - 3} Tasks</span>
													</div>
												);
											return (
												<HoverCard key={task.id}>
													<HoverCardTrigger
														className={cn(
															"flex h-1/4 items-center justify-start gap-1 rounded-md bg-muted-foreground p-1 px-2 text-xs text-white shadow dark:bg-accent md:text-sm",
														)}
													>
														{task.status !== "DONE" && isPast(task.dueDate) && (
															<div>
																<span className="block h-[8px] w-[8px] rounded-full bg-red-500" />
															</div>
														)}
														{task.status === "DONE" && (
															<div>
																<span className="block h-[8px] w-[8px] rounded-full bg-emerald-500" />
															</div>
														)}
														<span className="truncate">{task.name}</span>
													</HoverCardTrigger>
													<HoverCardContent className="space-y-2">
														<h4 className="text-lg font-bold">{task.name}</h4>
														<p className="text-sm">{task.description}</p>
														<div className="flex items-center pt-2">
															{task.status === "DONE" && (
																<CheckCheck className="text-emerald-500" size={15} />
															)}
															<CalendarDays
																className={cn("mr-2 h-4 w-4 opacity-70", {
																	"text-emerald-500": task.status === "DONE",
																	"text-red-500": task.status !== "DONE" && isPast(task.dueDate),
																})}
															/>
															<span className="text-xs text-muted-foreground">
																{intlFormat(task.dueDate, {
																	month: "short",
																	day: "2-digit",
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</span>
														</div>
													</HoverCardContent>
												</HoverCard>
											);
										})}
									</div>
								</div>
							</AspectRatio>
						);
					})}
				</div>
			</div>
		</>
	);
};

export default CalendarComponent;
