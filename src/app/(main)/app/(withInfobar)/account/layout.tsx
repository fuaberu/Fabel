import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";
import AccountAvatar from "./_components/AccountAvatar";

const layout = async ({
	children,
}: Readonly<{
	children: ReactNode;
}>) => {
	const user = await auth();

	return (
		<div className="mx-auto grid h-full w-full max-w-screen-lg grid-cols-12 gap-4">
			<aside className="col-span-12 flex flex-col items-center gap-8 md:col-span-4">
				<AccountAvatar session={user} />
				<div className="flex w-full max-w-44 flex-col gap-2">
					<Button className="h-fit w-full text-lg font-medium" variant="outline" asChild>
						<Link href="/app/account">General</Link>
					</Button>
					{/* <Button className="w-full text-lg font-medium h-fit" variant="outline" asChild>
						<Link href="/app/account/billing">Billing</Link>
					</Button> */}
					{/* <Button className="w-full text-lg font-medium h-fit" variant="secondary">
						Upgrade to Premium
					</Button> */}
				</div>
			</aside>
			<aside className="col-span-12 md:col-span-8">{children}</aside>
		</div>
	);
};

export default layout;
