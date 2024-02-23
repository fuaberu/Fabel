"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useMemo } from "react";
import { icons } from "@/lib/icons";
import { Menu } from "lucide-react";
import { useProjects } from "@/providers/ProjectsProvider";

export const SidebarMobile = () => {
	return (
		<Sheet>
			<SheetTrigger asChild className="md:!hidden">
				<Button variant="outline" size={"icon"}>
					<Menu />
				</Button>
			</SheetTrigger>

			<SheetContent
				side={"left"}
				className={cn(
					"fixed top-0 border-r-[1px] bg-background/80 p-6 backdrop-blur-xl md:!hidden",
				)}
			>
				<OptionsMenu />
			</SheetContent>
		</Sheet>
	);
};

interface Props {
	isCollapsed?: boolean;
}

export const OptionsMenu = ({ isCollapsed }: Props) => {
	const pathName = usePathname();

	const { projects } = useProjects();

	const sidebarOpt = useMemo(
		() =>
			projects.map((project) => ({
				name: project.name,
				href: `/app/projects/${project.id}`,
				icon: project.icon,
			})),
		[projects],
	);

	return (
		<div className="flex h-full flex-col">
			<Link href={"/app"} className="mb-4 flex h-16 flex-col items-center justify-center border-b">
				<h1 className="text-center text-6xl">{isCollapsed ? "F" : "FABEL"}</h1>
			</Link>

			<nav className={cn("relative overflow-visible px-2")}>
				{sidebarOpt.map((option, i) => {
					const Icon = icons[option.icon];
					return (
						<div key={i} className="mb-2 w-full">
							{isCollapsed ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											href={option.href}
											className={cn(
												"flex w-full items-center justify-center gap-2 rounded-md p-1 font-semibold text-primary-foreground transition-all duration-500 hover:bg-transparent hover:text-primary",
												pathName.startsWith(option.href) ? "bg-primary" : "text-muted-foreground",
											)}
										>
											<Icon size={35} />
										</Link>
									</TooltipTrigger>
									<TooltipContent side="right">{option.name}</TooltipContent>
								</Tooltip>
							) : (
								<Link
									href={option.href}
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-1 py-2 font-semibold text-primary-foreground transition-all duration-500 hover:bg-transparent hover:text-primary",
										pathName.startsWith(option.href) ? "bg-primary" : "text-muted-foreground",
									)}
								>
									<Icon size={35} />
									<span>{option.name}</span>
								</Link>
							)}
						</div>
					);
				})}
			</nav>
		</div>
	);
};
