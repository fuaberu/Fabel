"use client";

import { ModeToggle } from "@/components/global/ModeToggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
	const pathname = usePathname();
	return (
		<div className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
			<Link href={"/"}>
				<aside className="flex items-center gap-2">
					<Image
						src={"/logo.svg"}
						width={40}
						height={40}
						alt="Fabel logo"
						className="block dark:hidden"
					/>
					<Image
						src={"/logoDark.svg"}
						width={40}
						height={40}
						alt="Fabel logo"
						className="hidden dark:block"
					/>
					<span className="text-xl font-bold">Fabel.</span>
				</aside>
			</Link>
			{/* <nav className="absolute left-[50%] top-[50%] hidden translate-x-[-50%] translate-y-[-50%] transform md:block">
				<ul className="flex items-center justify-center gap-8">
					<Link href={"#"}>Pricing</Link>
					<Link href={"#"}>About</Link>
					<Link href={"#"}>Features</Link>
				</ul>
			</nav> */}
			<aside className="flex items-center gap-2">
				{!pathname.startsWith("/auth/sign-in") && (
					<Link
						href={"/auth/sign-in"}
						className="rounded-md bg-primary p-2 px-4 text-white hover:bg-primary/80"
					>
						Sign in
					</Link>
				)}
				<ModeToggle />
			</aside>
		</div>
	);
};

export default Navigation;
