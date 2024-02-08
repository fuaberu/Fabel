import { TooltipProvider } from "@/components/ui/tooltip";
import ModalProvider from "@/providers/ModalProvider";
import React from "react";
import { Toaster } from "sonner";

const Layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<ModalProvider>
			<TooltipProvider>{children}</TooltipProvider>
			<Toaster />
		</ModalProvider>
	);
};

export default Layout;
