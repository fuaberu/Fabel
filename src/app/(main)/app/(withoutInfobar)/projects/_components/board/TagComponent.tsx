import { FC } from "react";
import { cn } from "@/lib/utils";
import { TagColor } from "@prisma/client";

interface Props {
	color: TagColor;
	title?: string;
}

const TagComponent: FC<Props> = ({ color, title }) => {
	return (
		<div
			className={cn("h-8 w-fit min-w-8 flex-shrink-0 cursor-pointer rounded-sm p-2 text-xs", {
				"bg-gray-400/20 text-gray-500": color === "GRAY",
				"bg-red-400/20 text-red-500": color === "RED",
				"bg-orange-400/20 text-orange-500": color === "ORANGE",
				"bg-amber-400/20 text-amber-500": color === "AMBER",
				"bg-yellow-400/20 text-yellow-500": color === "YELLOW",
				"bg-lime-400/20 text-lime-500": color === "LIME",
				"bg-emerald-400/20 text-emerald-500": color === "EMERALD",
				"bg-teal-400/20 text-teal-500": color === "TEAL",
				"bg-cyan-400/20 text-cyan-500": color === "CYAN",
				"bg-sky-400/20 text-sky-500": color === "SKY",
				"bg-blue-400/20 text-blue-500": color === "BLUE",
				"bg-indigo-400/20 text-indigo-500": color === "INDIGO",
				"bg-violet-400/20 text-violet-500": color === "VIOLET",
				"bg-purple-400/20 text-purple-500": color === "PURPLE",
				"bg-fuchsia-400/20 text-fuchsia-500": color === "FUCHSIA",
				"bg-pink-400/20 text-pink-500": color === "PINK",
				"bg-rose-400/20 text-rose-500": color === "ROSE",
			})}
		>
			{title}
		</div>
	);
};

export default TagComponent;
