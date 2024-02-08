import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
	return <div className="fixed inset-0 z-[20] overflow-hidden bg-background">{children}</div>;
};

export default Layout;
