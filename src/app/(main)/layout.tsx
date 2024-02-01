import React from "react";
import { Toaster } from "sonner";

const Layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<>
			{children}
			<Toaster />
		</>
	);
};

export default Layout;
