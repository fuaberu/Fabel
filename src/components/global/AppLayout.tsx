import { ReactNode } from "react";
import InfoBar from "./InfoBar";
import { SidebarDesktop } from "../sidebar";

interface Props {
	children: ReactNode;
	notifications: any;
}

const AppLayout = ({ children, notifications }: Props) => {
	return (
		<div className="h-[100svh] overflow-hidden">
			<SidebarDesktop />
			<div className="h-full overflow-y-auto bg-muted/60 p-2 pt-[calc(theme(spacing.20)+theme(spacing.1))] dark:bg-muted/40 md:pl-[calc(theme(spacing.80)-theme(spacing.2))]">
				<InfoBar notifications={notifications} />
				{children}
			</div>
		</div>
	);
};

export default AppLayout;
