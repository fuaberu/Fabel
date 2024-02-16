"use client";

import { ReactNode, useState } from "react";
import InfoBar from "./InfoBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { cn } from "@/lib/utils";
import { OptionsMenu } from "../sidebar";

interface Props {
	children: ReactNode;
	notifications: any;
	defaultLayout: number[] | undefined;
	defaultCollapsed?: boolean;
}

const AppLayout = ({
	children,
	notifications,
	defaultLayout = [20, 80],
	defaultCollapsed,
}: Props) => {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	const onLayout = (sizes: number[]) => {
		if (typeof window === "undefined") return;
		document.cookie = `app:layout=${JSON.stringify(sizes)}`;
	};

	return (
		<div className="mx-auto h-[100svh] max-w-screen-2xl overflow-hidden">
			<ResizablePanelGroup direction="horizontal" onLayout={onLayout}>
				<ResizablePanel
					defaultSize={defaultLayout[0]}
					collapsedSize={4}
					collapsible={true}
					minSize={10}
					maxSize={20}
					onCollapse={() => {
						setIsCollapsed(true);
						document.cookie = `app:collapsed=${JSON.stringify(true)}`;
					}}
					onExpand={() => {
						setIsCollapsed(false);
						document.cookie = `app:collapsed=${JSON.stringify(false)}`;
					}}
					className={cn(
						"hidden md:block",
						isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out",
					)}
				>
					<OptionsMenu isCollapsed={isCollapsed} />
				</ResizablePanel>

				<ResizableHandle className="hidden md:flex" withHandle />

				<ResizablePanel defaultSize={defaultLayout[1]} className="relative">
					<div className="h-full overflow-y-auto bg-muted/60 px-2 pb-2 pt-[calc(theme(spacing.20)+theme(spacing.2))] dark:bg-muted/40">
						<InfoBar notifications={notifications} />
						{children}
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default AppLayout;
