"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ModeToggle } from "./ModeToggle";
import UserButton from "./UserButton";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { SidebarMobile } from "../sidebar";
import { ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ProjectAppActivity, useProjects } from "@/providers/ProjectsProvider";

type Props = {
	className?: string;
	children?: ReactNode;
};

const InfoBar = ({ className, children }: Props) => {
	const { projects } = useProjects();

	const activity = useMemo(
		() =>
			projects.reduce<ProjectAppActivity[]>((acc, project) => {
				if (project.activities.length === 0) return acc;

				return [...acc, ...project.activities];
			}, []),
		[projects],
	);
	return (
		<div
			className={cn(
				"relative flex h-16 w-full items-center gap-2 border-b-[1px] bg-background/80 p-2 backdrop-blur-md md:p-3",
				className,
			)}
		>
			<SidebarMobile />
			<div className="z-40 flex flex-1 items-center gap-2">
				<div className="mr-auto">{children}</div>
				<ModeToggle />
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon" className="text-primary">
							<Bell size={20} />
						</Button>
					</SheetTrigger>
					<SheetContent className="overflow-y-auto">
						<SheetHeader className="text-left">
							<SheetTitle>Activities</SheetTitle>
							<SheetDescription>App actions history</SheetDescription>
						</SheetHeader>
						<Separator className="my-4" />
						{activity.map((notification) => (
							<div
								key={notification.id}
								className="mb-2 flex flex-col gap-y-2 overflow-x-auto text-ellipsis"
							>
								<div className="flex gap-2">
									<Avatar>
										<AvatarImage src={notification.user.image || undefined} alt="Profile Picture" />
										<AvatarFallback className="bg-primary">
											{notification.user.name.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col">
										<p>
											<span className="">{notification.user.name.split(" ")[0]}</span>{" "}
											<span className="font-bold">{notification.description}</span>{" "}
											<span className="capitalize text-muted-foreground">
												{notification.type.toLowerCase()}
											</span>
										</p>
										<small className="text-xs text-muted-foreground">
											{new Date(notification.createdAt).toLocaleDateString()}
										</small>
									</div>
								</div>
							</div>
						))}
						{activity.length === 0 && (
							<div className="flex items-center justify-center text-muted-foreground">
								You have no notifications
							</div>
						)}
					</SheetContent>
				</Sheet>
				<UserButton />
			</div>
		</div>
	);
};

export default InfoBar;
