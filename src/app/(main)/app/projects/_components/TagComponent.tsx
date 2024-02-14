import { cn } from "@/lib/utils";
import { TagColor } from "@prisma/client";
import { FC } from "react";

interface Props {
	color: TagColor;
	title?: string;
	selectedColor?: (color: string) => void;
}

const TagComponent: FC<Props> = ({ color, title, selectedColor }) => {
	return (
		<div
			className={cn("flex-shrink-0 cursor-pointer rounded-sm p-2 text-xs", {
				"bg-sky-400/10 text-sky-400": color === "BLUE",
				"bg-orange-300/10 text-orange-300": color === "ORANGE",
				"bg-rose-500/10 text-rose-500": color === "ROSE",
				"bg-emerald-400/10 text-emerald-400": color === "GREEN",
				"bg-purple-400/10 text-purple-400": color === "PURPLE",
				"border-[1px] border-sky-400": color === "BLUE" && !title,
				"border-[1px] border-orange-300": color === "ORANGE" && !title,
				"border-[1px] border-rose-500": color === "ROSE" && !title,
				"border-[1px] border-emerald-400": color === "GREEN" && !title,
				"border-[1px] border-purple-400": color === "PURPLE" && !title,
			})}
			onClick={() => {
				if (selectedColor) selectedColor(color);
			}}
		>
			{title}
		</div>
	);
};

export default TagComponent;
