"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { KanbanSquare, Menu } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const sidebarOpt = [
	{
		name: "Projects",
		href: "/app/projects",
		icon: KanbanSquare,
	},
	// {
	// 	name: "Pages",
	// 	href: "/app/pages",
	// 	icon: LinkIcon,
	// },
];

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
	return (
		<div className="flex h-full flex-col">
			<div className="mb-4 flex h-20 flex-col items-center justify-center border-b">
				<h1 className="text-center text-6xl">{isCollapsed ? "F" : "FABEL"}</h1>
			</div>

			<nav className={cn("relative overflow-visible px-2")}>
				{sidebarOpt.map((sidebarOptions, i) => {
					return (
						<div key={i} className="mb-2 w-full">
							{isCollapsed ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											href={sidebarOptions.href}
											className={cn(
												"flex w-full items-center justify-center gap-2 rounded-md px-1 py-2 font-semibold text-primary-foreground transition-all duration-500 hover:bg-transparent hover:text-primary",
												pathName.startsWith(sidebarOptions.href)
													? "bg-primary"
													: "text-muted-foreground",
											)}
										>
											<sidebarOptions.icon size={35} />
										</Link>
									</TooltipTrigger>
									<TooltipContent side="right">{sidebarOptions.name}</TooltipContent>
								</Tooltip>
							) : (
								<Link
									href={sidebarOptions.href}
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-1 py-2 font-semibold text-primary-foreground transition-all duration-500 hover:bg-transparent hover:text-primary",
										pathName.startsWith(sidebarOptions.href)
											? "bg-primary"
											: "text-muted-foreground",
									)}
								>
									{sidebarOptions.icon && <sidebarOptions.icon size={35} />}
									<span>{sidebarOptions.name}</span>
								</Link>
							)}
						</div>
					);
				})}
			</nav>
		</div>
	);
};
