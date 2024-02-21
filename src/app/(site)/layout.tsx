import { ReactNode } from "react";
import Navigation from "@/components/site/navigation";

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<main className="min-h-full w-full">
			<Navigation />
			{children}
		</main>
	);
};

export default Layout;
