import { auth } from "@/auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/lib/db";
import ModalProvider from "@/providers/ModalProvider";
import ProjectsProvider from "@/providers/ProjectsProvider";
import React from "react";

const Layout = async ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const user = await auth();

	const projects = await db.board.findMany({
		where: { users: { some: { userId: user.id } } },
		select: {
			id: true,
			name: true,
			icon: true,
			columns: {
				select: {
					id: true,
					name: true,
					taskStatus: true,
					tasks: { select: { id: true, name: true, dueDate: true, completedDate: true } },
				},
			},
		},
	});

	return (
		<ModalProvider>
			<TooltipProvider>
				<ProjectsProvider value={projects}>{children}</ProjectsProvider>
			</TooltipProvider>
		</ModalProvider>
	);
};

export default Layout;
