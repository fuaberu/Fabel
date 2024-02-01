import BlurPage from "@/components/global/BlurPage";
import InfoBar from "@/components/global/InfoBar";
import Sidebar from "@/components/sidebar";
import { getAllNotifications } from "@/lib/queries/notification";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";

const Layout = async ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const session = auth();

	if (!session) {
		return redirect("/");
	}

	const user = await db.user.findUnique({ where: { id: session.id } });

	if (!user || !user.active) {
		return redirect("/auth/sign-in");
	}

	const notifications = await getAllNotifications(session.id);

	return (
		<div className="h-[100svh] overflow-hidden">
			<Sidebar />
			<div className="md:pl-[300px]">
				<InfoBar notifications={notifications} />
				<div className="relative">
					<BlurPage>{children}</BlurPage>
				</div>
			</div>
		</div>
	);
};

export default Layout;
