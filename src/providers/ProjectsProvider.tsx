"use client";

import { Board, Column, ProjectActivity, Tag, Task, User } from "@prisma/client";
import { Dispatch, FC, SetStateAction, createContext, useContext, useState } from "react";

export type ProjectAppActivity = Pick<
	ProjectActivity,
	"id" | "description" | "type" | "entityId" | "createdAt"
> & {
	user: Pick<User, "id" | "name" | "image">;
};

type ProjectApp = Pick<Board, "id" | "name" | "icon"> & {
	columns: (Pick<Column, "id" | "name" | "taskStatus"> & {
		tasks: Pick<Task, "id" | "dueDate" | "completedDate" | "name">[];
	})[];
	activities: ProjectAppActivity[];
	tags: Pick<Tag, "id" | "name" | "color">[];
};

const ProjectsContext = createContext<{
	projects: ProjectApp[];
	setProjects: Dispatch<SetStateAction<ProjectApp[]>>;
}>({ projects: [], setProjects: () => {} });

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

	return (
		<ProjectsContext.Provider value={{ projects, setProjects }}>
			{children}
		</ProjectsContext.Provider>
	);
};

export default ProjectsProvider;
