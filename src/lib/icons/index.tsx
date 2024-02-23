import { ProjectIcons } from "@prisma/client";
import { KanbanSquare, Laptop, LucideIcon, Syringe } from "lucide-react";

export const icons: { [key in ProjectIcons]: LucideIcon } = {
	KANBAN: KanbanSquare,
	SYRINGE: Syringe,
	LAPTOP: Laptop,
	CALENDAR: Laptop,
};
