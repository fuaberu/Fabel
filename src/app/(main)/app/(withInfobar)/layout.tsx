import { db } from "@/lib/db";
import { auth } from "@/auth";
import AppLayout from "@/components/global/AppLayout";
import { cookies } from "next/headers";

const Layout = async ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const layout = cookies().get("app:layout");
	const collapsed = cookies().get("app:collapsed");

	const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
	const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

	return (
		<AppLayout defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed} infoBar>
			{children}
		</AppLayout>
	);
};

export default Layout;
