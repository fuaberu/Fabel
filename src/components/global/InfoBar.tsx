"use client";

import { Notification, User } from "@prisma/client";
import { twMerge } from "tailwind-merge";
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

type Props = {
	notifications: (Notification & { user: Pick<User, "id" | "name" | "image"> })[];
	className?: string;
};

const InfoBar = ({ notifications, className }: Props) => {
	return (
		<>
			<div
				className={twMerge(
					"fixed left-0 right-0 top-0 z-[20] flex items-center gap-4 border-b-[1px] bg-background/80 p-4 backdrop-blur-md md:left-[300px]",
					className,
				)}
			>
				<SidebarMobile />
				<div className="ml-auto flex items-center gap-2">
					<ModeToggle />
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="text-primary">
								<Bell size={20} />
							</Button>
						</SheetTrigger>
						<SheetContent className="overflow-y-auto">
							<SheetHeader className="text-left">
								<SheetTitle>Notifications</SheetTitle>
								<SheetDescription>App actions history</SheetDescription>
							</SheetHeader>
							<Separator className="my-4" />
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className="mb-2 flex flex-col gap-y-2 overflow-x-auto text-ellipsis"
								>
									<div className="flex gap-2">
										<Avatar>
											<AvatarImage
												src={notification.user.image || undefined}
												alt="Profile Picture"
											/>
											<AvatarFallback className="bg-primary">
												{notification.user.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<p>
												<span className="font-bold">{notification.notification.split("|")[0]}</span>
												<span className="text-muted-foreground">
													{notification.notification.split("|")[1]}
												</span>
												<span className="font-bold">{notification.notification.split("|")[2]}</span>
											</p>
											<small className="text-xs text-muted-foreground">
												{new Date(notification.createdAt).toLocaleDateString()}
											</small>
										</div>
									</div>
								</div>
							))}
							{notifications?.length === 0 && (
								<div className="flex items-center justify-center text-muted-foreground">
									You have no notifications
								</div>
							)}
						</SheetContent>
					</Sheet>
					<UserButton />
				</div>
			</div>
		</>
	);
};

export default InfoBar;
