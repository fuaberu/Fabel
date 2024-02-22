import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { endOfDay, format, isPast, startOfDay } from "date-fns";
import { CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Page = async () => {
	const session = await auth();

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
			<div className="flex items-center justify-between">
				<h1 className="text-4xl">Dashboard</h1>
				<span className="block">
					{session.subscription?.tier}
					{session.subscription?.currentPeriodEndDate &&
						(isPast(session.subscription.currentPeriodEndDate)
							? ` | Ended`
							: ` | ${format(session.subscription.currentPeriodEndDate, "P")}`)}
				</span>
			</div>
			<Separator className="" />
			<h2>Hello {session.name}</h2>

			{todayTasks.length > 0 && (
				<section className="space-y-4">
					<h3 className="text-xl font-semibold">Today&apos;s Tasks</h3>
					<div className="flex w-full gap-2 overflow-x-auto p-1">
						{todayTasks.map((task) => {
							return (
								<Link
									key={task.id}
									href={`/app/projects/${task.column.boardId}`}
									className="flex w-full max-w-56 flex-col space-y-2 rounded-md bg-card p-3 shadow"
								>
									<h4 className="text-lg font-bold">{task.name}</h4>
									<p className="line-clamp-3 flex-1 text-secondary-foreground">
										{task.description}
									</p>
									<div
										className={cn("flex items-center justify-end gap-2 text-orange-300", {
											"text-emerald-500": task.column.taskStatus === "DONE" && task.completedDate,
											"text-red-500":
												task.dueDate && task.column.taskStatus !== "DONE" && isPast(task.dueDate),
										})}
									>
										{task.column.taskStatus === "DONE" && <CheckCheck size={15} />}
										{task.dueDate && task.column.taskStatus !== "DONE" && isPast(task.dueDate) && (
											<Clock size={15} />
										)}
										{task.dueDate && format(task.dueDate, "p")}
									</div>
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
