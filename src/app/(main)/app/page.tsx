import React from "react";
import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endOfDay, isPast, startOfDay } from "date-fns";
import { smallDateTime } from "@/lib/datetime";
import { CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Page = async () => {
	const session = await auth();

	if (!session) return redirect("/site");

	const now = new Date();
	const endOfToday = endOfDay(now);
	const startOfToday = startOfDay(now);

	const todayTasks = await db.task.findMany({
		where: {
			dueDate: { gte: startOfToday, lte: endOfToday },
			column: { board: { users: { some: { userId: session.id } } } },
		},
		include: { column: { include: { board: true } } },
		orderBy: { dueDate: "asc" },
	});

	return (
		<div className="relative h-full space-y-6">
			<h1 className="text-4xl">Dashboard</h1>
			<Separator className="" />
			<h2>Hello {session.name}</h2>

			{todayTasks.length > 0 && (
				<section className="space-y-4">
					<h3>Today's Tasks</h3>
					<div className="flex w-full gap-2 overflow-x-auto">
						{todayTasks.map((task) => {
							return (
								<Link
									key={task.id}
									href={`/app/projects/${task.column.boardId}`}
									className="flex w-full max-w-56 flex-col space-y-2 rounded-md bg-card p-3 shadow"
								>
									<h4 className="text-lg font-bold">{task.name}</h4>
									<p className="line-clamp-3 text-secondary">{task.description}</p>
									<span
										className={cn("flex items-center gap-2", {
											"text-emerald-500": task.column.taskStatus === "DONE",
											"text-red-500":
												task.dueDate && task.column.taskStatus !== "DONE" && isPast(task.dueDate),
										})}
									>
										{task.column.taskStatus === "DONE" && <CheckCheck size={15} />}
										{task.dueDate && task.column.taskStatus !== "DONE" && isPast(task.dueDate) && (
											<Clock size={15} />
										)}
										{task.dueDate && smallDateTime(task.dueDate)}
									</span>
								</Link>
							);
						})}
					</div>
				</section>
			)}
		</div>
	);
};

export default Page;
