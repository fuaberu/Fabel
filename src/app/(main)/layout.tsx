import { TooltipProvider } from "@/components/ui/tooltip";
import ModalProvider from "@/providers/ModalProvider";
import React from "react";

const Layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<ModalProvider>
			<TooltipProvider>{children}</TooltipProvider>
		</ModalProvider>
	);
};

export default Layout;
