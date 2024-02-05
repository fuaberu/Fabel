import Navigation from "@/components/site/navigation";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<main className="min-h-full w-full">
			<Navigation />
			{children}
		</main>
	);
};

export default Layout;
