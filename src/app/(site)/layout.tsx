import { ReactNode } from "react";
import Navigation from "@/components/site/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: ReactNode }) => {
	const session = await auth(true);

	if (session) return redirect("/app");

	return (
		<main className="min-h-full w-full">
			<Navigation />
			{children}
		</main>
	);
};

export default Layout;
