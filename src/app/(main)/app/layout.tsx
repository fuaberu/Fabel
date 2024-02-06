import BlurPage from "@/components/global/BlurPage";
import InfoBar from "@/components/global/InfoBar";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";

const Layout = async ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const user = await auth();

	if (!user) {
		return redirect("/");
	}

	const notifications = await db.notification.findMany({
		where: { user: { id: user.id } },
		include: { user: { select: { id: true, name: true, image: true } } },
		orderBy: {
			createdAt: "desc",
		},
		take: 50,
	});

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
