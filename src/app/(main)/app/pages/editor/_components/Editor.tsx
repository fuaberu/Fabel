"use client";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";
import React, { useEffect } from "react";
import { useEditor } from "@/providers/EditorProvider";
import { cn } from "@/lib/utils";
import EditorComponentCreator from "./editorComponents";

interface Props {
	liveMode?: boolean;
}

const Editor = ({ liveMode }: Props) => {
	const { dispatch, state } = useEditor();

	useEffect(() => {
		if (liveMode) {
			dispatch({
				type: "TOGGLE_LIVE_MODE",
				payload: { value: true },
			});
		}
	}, [liveMode]);

	const handleClick = () => {
		dispatch({
			type: "CHANGE_CLICKED_ELEMENT",
			payload: {},
		});
	};

	const handleUnpreview = () => {
		dispatch({ type: "TOGGLE_PREVIEW_MODE" });
		dispatch({ type: "TOGGLE_LIVE_MODE" });
	};
	return (
		<div
			className={cn(
				"use-automation-zoom-in h-full w-full overflow-auto bg-background transition-all",
				{
					"!mr-0 !p-0": state.editor.previewMode === true || state.editor.liveMode === true,
				},
			)}
			onClick={handleClick}
		>
			{state.editor.previewMode && state.editor.liveMode && (
				<Button
					variant={"ghost"}
					size={"icon"}
					className="fixed left-0 top-0 z-[100] h-6 w-6 bg-slate-600 p-[2px]"
					onClick={handleUnpreview}
				>
					<EyeOff />
				</Button>
			)}
			{Array.isArray(state.editor.elements) &&
				state.editor.elements.map((childElement) => (
					<EditorComponentCreator key={childElement.id} element={childElement} />
				))}
		</div>
	);
};

export default Editor;
