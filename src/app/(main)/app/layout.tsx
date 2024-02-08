import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import AppLayout from "@/components/global/AppLayout";

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

	return <AppLayout notifications={notifications}>{children}</AppLayout>;
};

export default Layout;
