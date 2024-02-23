"use client";

import { Board, Column, Task } from "@prisma/client";
import { FC, createContext, useContext, useState } from "react";

type ProjectApp = Pick<Board, "id" | "name" | "icon"> & {
	columns: (Pick<Column, "id" | "name" | "taskStatus"> & {
		tasks: Pick<Task, "id" | "dueDate" | "completedDate" | "name">[];
	})[];
};

const ProjectsContext = createContext<ProjectApp[]>([]);

export const useProjects = () => {
	const context = useContext(ProjectsContext);
	if (!context) {
		throw new Error("useProjects must be used within the projects provider");
	}
	return context;
};

interface ProviderProps {
	children: React.ReactNode;
	value: ProjectApp[];
}

const ProjectsProvider: FC<ProviderProps> = ({ children, value }) => {
	const [projects, setProjects] = useState<ProjectApp[]>(value);

	return <ProjectsContext.Provider value={projects}>{children}</ProjectsContext.Provider>;
};

export default ProjectsProvider;
