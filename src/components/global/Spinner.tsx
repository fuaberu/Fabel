import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg" | "xl";
	type?: "primary" | "secondary";
}

const Spinner = ({ size = "md", type }: Props) => {
	let dimentions;
	switch (size) {
		case "sm":
			dimentions = "h-4 w-4";
			break;
		case "md":
			dimentions = "h-8 w-8";
			break;
		case "lg":
			dimentions = "h-16 w-16";
			break;
		case "xl":
			dimentions = "h-24 w-24";
			break;

		default:
			dimentions = "h-8 w-8";
			break;
	}

	let textColor;
	switch (type) {
		case "primary":
			textColor = "text-primary";
			break;
		case "secondary":
			textColor = "text-secondary";
			break;
		default:
			textColor = "text-primary";
	}

	return (
		<div
			className={cn(
				"inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
				textColor,
				dimentions,
			)}
			role="status"
		>
			<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
				Loading...
			</span>
		</div>
	);
	{
		/* <div
		className={cn(
			borderColor,
			borderWidth,
			"animate-spin rounded-full border-solid border-t-transparent bg-transparent",
			dimentions,
			className,
		)}
	></div> */
	}
};

export default Spinner;
