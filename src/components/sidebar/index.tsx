"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { KanbanSquare, Menu, Link as LinkIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const sidebarOpt = [
	{
		name: "Boards",
		href: "/app/boards",
		icon: KanbanSquare,
	},
	{
		name: "Pages",
		href: "/app/pages",
		icon: LinkIcon,
	},
];

const Sidebar = () => {
	const [isMounted, setIsMounted] = useState(false);

	const isDesktop = useMediaQuery("(min-width: 768px)");

	const openState = useMemo(() => (isDesktop ? { open: true } : {}), [isDesktop]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return;

	return (
		<Sheet modal={false} {...openState}>
			<SheetTrigger asChild className="felx absolute left-4 top-4 z-[100] md:!hidden">
				<Button variant="outline" size={"icon"}>
					<Menu />
				</Button>
			</SheetTrigger>

			<SheetContent
				showX={!isDesktop}
				side={"left"}
				className={cn("fixed top-0 border-r-[1px] bg-background/80 p-6 backdrop-blur-xl", {
					"z-0 hidden w-[300px] md:inline-block": isDesktop,
					"z-[100] inline-block w-full md:hidden": !isDesktop,
				})}
			>
				<div>
					<AspectRatio ratio={16 / 5}>
						<h1 className="text-6xl">FABEL</h1>
					</AspectRatio>
					<p className="mb-2 text-xs text-muted-foreground">MENU LINKS</p>
					<Separator className="mb-4" />
					<nav className="relative">
						<Command className="overflow-visible rounded-lg bg-transparent">
							<CommandInput placeholder="Search..." autoComplete="new-password" />
							<CommandList className="overflow-visible py-4">
								<CommandEmpty>No Results Found</CommandEmpty>
								<CommandGroup className="overflow-visible">
									{sidebarOpt.map((sidebarOptions, i) => {
										return (
											<CommandItem key={i} className="mb-3 w-full md:w-[320px]">
												<Link
													href={sidebarOptions.href}
													className="flex w-full items-center gap-2 rounded-md bg-primary px-1 py-2 font-semibold text-primary-foreground transition-all hover:bg-transparent hover:text-primary md:w-[320px]"
												>
													{sidebarOptions.icon && <sidebarOptions.icon />}
													<span>{sidebarOptions.name}</span>
												</Link>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</nav>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default Sidebar;
