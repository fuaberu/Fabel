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
			{children}
			<Toaster />
		</ModalProvider>
	);
};

export default Layout;
