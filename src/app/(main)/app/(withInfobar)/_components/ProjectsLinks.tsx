"use client";

import { useProjects } from "@/providers/ProjectsProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isPast } from "date-fns";
import { ArrowUpRightFromSquare, CheckCheck, Clock } from "lucide-react";
import Link from "next/link";
import { icons } from "@/lib/icons";

const ProjectsLinks = () => {
	const projects = useProjects();

	return (
		<>
			<h4 className="text-xl">My projects</h4>
			<div className="flex gap-2 overflow-x-auto p-1">
				{projects.map((board) => {
					const Icon = icons[board.icon];
					return (
						<Link
							key={board.id}
							href={`/app/projects/${board.id}`}
							className="rounded-md ring-primary duration-200 hover:scale-[1.02] hover:ring-2"
						>
							<Card className="w-80 bg-card/60">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Icon size={28} />
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
					);
				})}
				{/* <BoardForm userId={session.id} /> */}
			</div>
		</>
	);
};

export default ProjectsLinks;
