"use client";

import { Notification } from "@prisma/client";
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

type Props = {
	notifications: Notification[];
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
				<div className="ml-auto flex items-center gap-2">
					<ModeToggle />
					<Sheet>
						<SheetTrigger>
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
								<Bell size={17} />
							</div>
						</SheetTrigger>
						<SheetContent className="overflow-y-auto">
							<SheetHeader className="text-left">
								<SheetTitle>Notifications</SheetTitle>
								<SheetDescription>App actions history</SheetDescription>
							</SheetHeader>
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className="mb-2 flex flex-col gap-y-2 overflow-x-scroll text-ellipsis"
								>
									<div className="flex gap-2">
										<Avatar>
											<AvatarImage src={notification.User.avatarUrl} alt="Profile Picture" />
											<AvatarFallback className="bg-primary">
												{notification.User.name.slice(0, 2).toUpperCase()}
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
								<div className="mt-4 flex items-center justify-center text-muted-foreground">
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
