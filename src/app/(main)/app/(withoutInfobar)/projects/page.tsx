import { auth } from "@/auth";
import InfoBar from "@/components/global/InfoBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { isPast } from "date-fns";
import { ArrowUpRightFromSquare, CheckCheck, Clock } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
	const session = await auth();

	const boards = await db.board.findMany({
		where: { users: { some: { userId: session.id } } },
		orderBy: { updatedAt: "desc" },
		include: {
			columns: { select: { taskStatus: true, tasks: { select: { id: true, dueDate: true } } } },
		},
	});

	if (boards.length > 0) {
		return (
			<>
				<InfoBar notifications={[]} />
				<div className="flex flex-wrap gap-2 p-2">
					{boards.map((board) => (
						<Link
							key={board.id}
							href={`/app/projects/${board.id}`}
							className="rounded-md ring-primary duration-200 hover:scale-[1.02] hover:ring-2"
						>
							<Card className="w-80 bg-card/60">
								<CardHeader>
									<CardTitle>
										<span className="clamp-1">{board.name}</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-col justify-between gap-7">
									<span className="flex justify-center gap-2">
										Open <ArrowUpRightFromSquare />
									</span>
									<div className="flex items-center justify-between">
										<span className="flex-1">
											{board.columns.reduce((a, b) => a + b.tasks.length, 0)} Tasks
										</span>
										<span>|</span>
										<div className="flex flex-1 items-center justify-end gap-2">
											<span className="flex items-center gap-1">
												{board.columns.reduce(
													(a, b) => a + (b.taskStatus === "DONE" ? b.tasks.length : 0),
													0,
												)}
												<CheckCheck className="text-emerald-500" />
											</span>
											<span className="flex items-center gap-1">
												{board.columns.reduce(
													(a, b) =>
														a +
														(b.taskStatus !== "DONE"
															? b.tasks.filter((t) => t.dueDate && isPast(t.dueDate)).length
															: 0),
													0,
												)}
												<Clock className="text-red-400 dark:text-red-700" />
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
					{/* <BoardForm userId={session.id} /> */}
				</div>
			</>
		);
	}

	let destination = "/app";
	try {
		const newBoard = await db.board.create({
			data: {
				name: "First Project",
				users: { create: { userId: session.id, role: "USER" } },
				columns: {
					createMany: {
						data: [
							{ name: "To Do", taskStatus: "NEW", order: 1.0 },
							{ name: "In Progress", taskStatus: "PROGRESS", order: 2.0 },
							{ name: "Done", taskStatus: "DONE", order: 3.0 },
						],
					},
				},
			},
		});

		revalidatePath("/app/projects");

		destination = `/app/projects/${newBoard.id}`;
	} catch (error) {
		console.error(error);
	} finally {
		redirect(destination);
	}
};

export default Page;
