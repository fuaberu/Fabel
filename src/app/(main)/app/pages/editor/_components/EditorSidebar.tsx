"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Database, Plus, SettingsIcon, SquareStackIcon } from "lucide-react";

const EditorSidebar = () => {
	return (
		<Sheet open={true} modal={false}>
			<Tabs className="w-full " defaultValue="Settings">
				<SheetContent
					showX={false}
					side="right"
					className={cn(
						"z-[80] mt-[97px] w-16 overflow-hidden  p-0 shadow-none transition-all focus:border-none",
						// { hidden: state.editor.previewMode },
					)}
				>
					<TabsList className=" flex h-fit w-full flex-col items-center justify-evenly gap-4 bg-transparent ">
						<TabsTrigger value="Settings" className="h-10 w-10 p-0 data-[state=active]:bg-muted">
							<SettingsIcon />
						</TabsTrigger>
						<TabsTrigger value="Components" className="h-10 w-10 p-0 data-[state=active]:bg-muted">
							<Plus />
						</TabsTrigger>

						<TabsTrigger value="Layers" className="h-10 w-10 p-0 data-[state=active]:bg-muted">
							<SquareStackIcon />
						</TabsTrigger>
						<TabsTrigger value="Media" className="h-10 w-10 p-0 data-[state=active]:bg-muted">
							<Database />
						</TabsTrigger>
					</TabsList>
				</SheetContent>
				<SheetContent
					showX={false}
					side="right"
					className={cn(
						"z-[40] mr-16 mt-[97px] h-full w-80 overflow-hidden bg-background p-0 shadow-none transition-all ",
						// { hidden: state.editor.previewMode },
					)}
				>
					<div className="grid h-full gap-4 overflow-scroll pb-36">
						<TabsContent value="Settings">
							<SheetHeader className="p-6 text-left">
								<SheetTitle>Styles</SheetTitle>
								<SheetDescription>
									Show your creativity! You can customize every component as you like.
								</SheetDescription>
							</SheetHeader>
							{/* <SettingsTab /> */}
						</TabsContent>
						<TabsContent value="Media">
							media
							{/* <MediaBucketTab subaccountId={subaccountId} /> */}
						</TabsContent>
						<TabsContent value="Components">
							<SheetHeader className="p-6 text-left ">
								<SheetTitle>Components</SheetTitle>
								<SheetDescription>You can drag and drop components on the canvas</SheetDescription>
							</SheetHeader>
							{/* <ComponentsTab /> */}
						</TabsContent>
					</div>
				</SheetContent>
			</Tabs>
		</Sheet>
	);
};

export default EditorSidebar;
