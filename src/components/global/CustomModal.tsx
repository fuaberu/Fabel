"use client";

import { useModal } from "@/providers/ModalProvider";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type Props = {
	title: string;
	subheading?: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
};

const CustomModal = ({ children, defaultOpen, subheading, title, size = "md" }: Props) => {
	const { isModalOpen, setModalClose } = useModal();

	return (
		<Dialog open={isModalOpen || defaultOpen} onOpenChange={setModalClose}>
			<DialogContent
				className={cn(
					"styled-scrollbar h-screen max-h-svh w-screen overflow-auto bg-card md:h-fit md:max-h-[90%]",
					{
						"max-w-screen-[460px]": size === "xs",
						"max-w-screen-sm": size === "sm",
						"max-w-screen-md": size === "md",
						"max-w-screen-lg": size === "lg",
						"max-w-screen-xl": size === "xl",
						"max-w-screen-2xl": size === "2xl",
					},
				)}
			>
				<DialogHeader className="text-left">
					<DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
					{subheading && (
						<DialogDescription className="text-sm text-muted-foreground">
							{subheading}
						</DialogDescription>
					)}
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
};

export default CustomModal;
