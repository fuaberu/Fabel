"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DeviceTypes, useEditor } from "@/providers/EditorProvider";
import { Page } from "@prisma/client";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ArrowLeftCircle, EyeIcon, Laptop, Redo2, Smartphone, Tablet, Undo2 } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
	pageDetails: Page;
}

const EditorNavigation = ({ pageDetails }: Props) => {
	const { state, dispatch } = useEditor();

	return (
		<TooltipProvider>
			<nav
				className={cn("flex items-center justify-between gap-2 border-b-[1px] p-3 transition-all")}
			>
				<aside className="flex w-[300px] max-w-[260px] items-center gap-4">
					<Link href={`/app/pages`}>
						<ArrowLeftCircle />
					</Link>
					<div className="flex w-full flex-col ">
						<Input defaultValue={pageDetails.name} className="m-0 h-5 border-none p-0 text-lg" />
						<span className="text-sm text-muted-foreground">Path: /{pageDetails.pathName}</span>
					</div>
				</aside>
				<aside>
					<Tabs
						defaultValue="Desktop"
						className="w-fit "
						value={state.editor.device}
						onValueChange={(value) => {
							dispatch({
								type: "CHANGE_DEVICE",
								payload: { device: value as DeviceTypes },
							});
						}}
					>
						<TabsList className="grid h-fit w-full grid-cols-3 gap-1 bg-transparent">
							<Tooltip>
								<TabsTrigger
									value="Desktop"
									className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
									asChild
								>
									<TooltipTrigger>
										<Laptop />
									</TooltipTrigger>
								</TabsTrigger>
								<TooltipContent>
									<p>Desktop</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TabsTrigger
									value="Tablet"
									className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
									asChild
								>
									<TooltipTrigger>
										<Tablet />
									</TooltipTrigger>
								</TabsTrigger>
								<TooltipContent>
									<p>Tablet</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TabsTrigger
									value="Mobile"
									className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
									asChild
								>
									<TooltipTrigger>
										<Smartphone />
									</TooltipTrigger>
								</TabsTrigger>
								<TooltipContent>
									<p>Mobile</p>
								</TooltipContent>
							</Tooltip>
						</TabsList>
					</Tabs>
				</aside>
				<aside className="flex items-center gap-2">
					<Button variant={"ghost"} size={"icon"}>
						<EyeIcon />
					</Button>
					<Button disabled={!(state.history.currentIndex > 0)} variant={"ghost"} size={"icon"}>
						<Undo2 />
					</Button>
					<Button
						disabled={!(state.history.currentIndex < state.history.history.length - 1)}
						variant={"ghost"}
						size={"icon"}
						className="mr-4 hover:bg-slate-800"
					>
						<Redo2 />
					</Button>
					<div className="item-center mr-4 flex flex-col">
						<div className="flex flex-row items-center gap-4">
							Draft
							<Switch disabled defaultChecked={true} />
							Publish
						</div>
						<span className="text-sm text-muted-foreground">
							Last updated{" "}
							{pageDetails.updatedAt ? pageDetails.updatedAt.toLocaleDateString() : "Never"}
						</span>
					</div>
					<Button>Save</Button>
				</aside>
			</nav>
		</TooltipProvider>
	);
};

export default EditorNavigation;
