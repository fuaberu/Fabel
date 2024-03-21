import { TagColor } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getTagBgColor(color: TagColor): string {
	switch (color) {
		case "GRAY":
			return "bg-gray-400 text-gray-500";
		case "RED":
			return "bg-red-400 text-red-500";
		case "ORANGE":
			return "bg-orange-400	text-orange-500";
		case "AMBER":
			return "bg-amber-400 text-amber-500";
		case "YELLOW":
			return "bg-yellow-400 text-yellow-500";
		case "LIME":
			return "bg-lime-400 text-lime-500";
		case "GREEN":
			return "bg-green-400 text-green-500";
		case "EMERALD":
			return "bg-emerald-400 text-emerald-500";
		case "TEAL":
			return "bg-teal-400 text-teal-500";
		case "CYAN":
			return "bg-cyan-400 text-cyan-500";
		case "SKY":
			return "bg-sky-400 text-sky-500";
		case "BLUE":
			return "bg-blue-400 text-blue-500";
		case "INDIGO":
			return "bg-indigo-400 text-indigo-500";
		case "VIOLET":
			return "bg-violet-400 text-violet-500";
		case "PURPLE":
			return "bg-purple-400 text-purple-500";
		case "FUCHSIA":
			return "bg-fuchsia-400 text-fuchsia-500";
		case "PINK":
			return "bg-pink-400 text-pink-500";
		case "ROSE":
			return "bg-rose-400 text-rose-500";
	}
}
