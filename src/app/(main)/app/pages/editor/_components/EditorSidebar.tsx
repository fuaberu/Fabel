"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Database, Plus, SettingsIcon, SquareStackIcon } from "lucide-react";

const EditorSidebar = () => {
	return (
		<TooltipProvider>
			<Tabs className="flex h-full w-full flex-row-reverse" defaultValue="Settings">
				<TabsList className="h-full rounded-none">
					<div className="flex w-12 flex-col items-center gap-4">
						<Tooltip>
							<TabsTrigger
								value="Settings"
								className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
								asChild
							>
								<TooltipTrigger>
									<SettingsIcon />
								</TooltipTrigger>
							</TabsTrigger>
							<TooltipContent side="left">
								<p>Settings</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TabsTrigger
								value="Components"
								className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
								asChild
							>
								<TooltipTrigger>
									<Plus />
								</TooltipTrigger>
							</TabsTrigger>
							<TooltipContent side="left">
								<p>Components</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TabsTrigger
								value="Layers"
								className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
								asChild
							>
								<TooltipTrigger>
									<SquareStackIcon />
								</TooltipTrigger>
							</TabsTrigger>
							<TooltipContent side="left">
								<p>Layers</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TabsTrigger
								value="Media"
								className="border border-input hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-primary"
								asChild
							>
								<TooltipTrigger>
									<Database />
								</TooltipTrigger>
							</TabsTrigger>
							<TooltipContent side="left">
								<p>Media</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</TabsList>
				<div className="grid h-full w-full gap-4 overflow-y-auto border-r-2 border-background">
					<TabsContent value="Settings">
						settings
						{/* <SettingsTab /> */}
					</TabsContent>
					<TabsContent value="Media">
						media
						{/* <MediaBucketTab subaccountId={subaccountId} /> */}
					</TabsContent>
					<TabsContent value="Layers">
						media
						{/* <MediaBucketTab subaccountId={subaccountId} /> */}
					</TabsContent>
					<TabsContent value="Components">
						comopnenst
						{/* <ComponentsTab /> */}
					</TabsContent>
				</div>
			</Tabs>
		</TooltipProvider>
	);
};

export default EditorSidebar;
