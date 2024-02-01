import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg";
	type?: "primary" | "secondary";
}

const Spinner = ({ className, size = "md", type = "secondary" }: Props) => {
	let dimentions;
	switch (size) {
		case "sm":
			dimentions = "h-4 w-4";
			break;
		case "md":
			dimentions = "h-8 w-8";
			break;
		case "lg":
			dimentions = "h-12 w-12";
			break;

		default:
			dimentions = "h-8 w-8";
			break;
	}

	let borderColor;
	switch (type) {
		case "primary":
			borderColor = "border-primary";
			break;
		case "secondary":
			borderColor = "border-secondary";
			break;

		default:
			borderColor = "border-secondary";
			break;
	}
	return (
		<div
			className={cn(
				borderColor,
				"animate-spin rounded-full border-2 border-solid border-t-transparent",
				dimentions,
				className,
			)}
		></div>
	);
};

export default Spinner;
