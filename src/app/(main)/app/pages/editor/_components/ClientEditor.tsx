"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Editor from "./Editor";
import EditorSidebar from "./EditorSidebar";

const ClientEditor = ({ defaultLayout = [33, 67] }: { defaultLayout: number[] | undefined }) => {
	const onLayout = (sizes: number[]) => {
		if (typeof window === "undefined") return;
		document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
	};

	return (
		<ResizablePanelGroup direction="horizontal" onLayout={onLayout}>
			<ResizablePanel defaultSize={defaultLayout[0]}>
				<Editor />
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={defaultLayout[1]}>
				<EditorSidebar />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};

export default ClientEditor;
