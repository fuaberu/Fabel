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
		<AppLayout defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed}>
			{children}
		</AppLayout>
	);
};

export default Layout;
