"use client";

import { Badge } from "@/components/ui/badge";
import { EditorElement, useEditor } from "@/providers/EditorProvider";
import clsx from "clsx";
import { Trash } from "lucide-react";
import React from "react";

type Props = {
	element: EditorElement;
};

const Text = (props: Props) => {
	const { dispatch, state } = useEditor();

	const handleDeleteElement = () => {
		dispatch({
			type: "DELETE_ELEMENT",
			payload: { elementDetails: props.element },
		});
	};
	const styles = props.element.styles;

	const handleOnClickBody = (e: React.MouseEvent) => {
		e.stopPropagation();
		dispatch({
			type: "CHANGE_CLICKED_ELEMENT",
			payload: {
				elementDetails: props.element,
			},
		});
	};

	//WE ARE NOT ADDING DRAG DROP
	return (
		<div
			style={styles}
			className={clsx("relative m-[5px] w-full p-[2px] text-[16px] transition-all", {
				"!border-blue-500": state.editor.selectedElement.id === props.element.id,

				"!border-solid": state.editor.selectedElement.id === props.element.id,
				"border-[1px] border-dashed border-slate-300": !state.editor.liveMode,
			})}
			onClick={handleOnClickBody}
		>
			{state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
				<Badge className="absolute -left-[1px] -top-[23px] rounded-none rounded-t-lg">
					{state.editor.selectedElement.name}
				</Badge>
			)}
			<span
				contentEditable={!state.editor.liveMode}
				onBlur={(e) => {
					const spanElement = e.target as HTMLSpanElement;
					dispatch({
						type: "UPDATE_ELEMENT",
						payload: {
							elementDetails: {
								...props.element,
								content: {
									innerText: spanElement.innerText,
								},
							},
						},
					});
				}}
			>
				{!Array.isArray(props.element.content) && props.element.content.innerText}
			</span>
			{state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
				<div className="absolute -right-[1px] -top-[25px] rounded-none rounded-t-lg bg-primary px-2.5 py-1 text-xs font-bold !text-white">
					<Trash className="cursor-pointer" size={16} onClick={handleDeleteElement} />
				</div>
			)}
		</div>
	);
};

export default Text;
