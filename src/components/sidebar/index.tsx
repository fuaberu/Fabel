"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { KanbanSquare, Menu } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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

export const SidebarDesktop = () => {
	return (
		<div className="fixed bottom-0 left-0 top-0 hidden w-[300px] border-r p-4 md:block">
			<OptionsMenu />
		</div>
	);
};

const OptionsMenu = () => {
	const pathName = usePathname();
	return (
		<div className="flex h-full flex-col gap-4">
			<AspectRatio ratio={16 / 5}>
				<h1 className="text-6xl">FABEL</h1>
			</AspectRatio>
			<Separator className="mb-4" />
			<nav className="relative overflow-visible">
				{sidebarOpt.map((sidebarOptions, i) => {
					return (
						<div key={i} className="mb-2 w-full">
							<Link
								href={sidebarOptions.href}
								className={cn(
									"flex w-full items-center gap-2 rounded-md px-1 py-2 font-semibold text-primary-foreground transition-all duration-500 hover:bg-transparent hover:text-primary",
									pathName.startsWith(sidebarOptions.href) ? "bg-primary" : "text-muted-foreground",
								)}
							>
								{sidebarOptions.icon && <sidebarOptions.icon />}
								<span>{sidebarOptions.name}</span>
							</Link>
						</div>
					);
				})}
			</nav>
		</div>
	);
};
