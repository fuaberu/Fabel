import { auth } from "@/auth";
import { isPast } from "date-fns";
import { redirect } from "next/navigation";

const Layout = async ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const user = await auth();

	if (user.subscription?.currentPeriodEndDate && isPast(user.subscription.currentPeriodEndDate)) {
		return redirect("/app");
	}

	return <>{children}</>;
};

export default Layout;
