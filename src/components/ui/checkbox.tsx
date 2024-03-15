"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { TagColor } from "@prisma/client";

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root & { color?: TagColor }>
>(({ className, color, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground",
			{
				"data-[state=checked]:bg-primary": !color,
				"border-[1px] border-gray-400 data-[state=checked]:bg-gray-400/70": color === "GRAY",
				"border-[1px] border-sky-400 data-[state=checked]:bg-sky-400/70": color === "BLUE",
				"border-[1px] border-orange-300 data-[state=checked]:bg-orange-300/70": color === "ORANGE",
				"border-[1px] border-rose-500 data-[state=checked]:bg-rose-500/70": color === "ROSE",
				"border-[1px] border-emerald-400 data-[state=checked]:bg-emerald-400/70": color === "GREEN",
				"border-[1px] border-purple-400 data-[state=checked]:bg-purple-400/70": color === "PURPLE",
			},
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
			<Check className="h-4 w-4" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
