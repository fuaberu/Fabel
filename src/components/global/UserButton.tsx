"use client";

import { signOut } from "@/auth";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { UserCheck, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

const UserMenu = () => {
	const router = useRouter();

	const handleLogout = () => {
		router.push("/");
		signOut();
		toast.success("Logged out");
	};

	return (
		<Menubar dir="rtl" className="p-0">
			<MenubarMenu>
				<MenubarTrigger asChild className="hover:cursor-pointer">
					<Button variant="outline">
						<User size={20} />
					</Button>
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						<MenubarShortcut>
							<UserCheck />
						</MenubarShortcut>
						<p>Account</p>
					</MenubarItem>
					<MenubarItem onClick={handleLogout}>
						<MenubarShortcut>
							<LogOut />
						</MenubarShortcut>
						<p>Loggout</p>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
};

export default UserMenu;
