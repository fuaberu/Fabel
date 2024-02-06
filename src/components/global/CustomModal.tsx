"use client";

import { useModal } from "@/providers/ModalProvider";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

type Props = {
	title: string;
	subheading?: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
};

const CustomModal = ({ children, defaultOpen, subheading, title }: Props) => {
	const { isModalOpen, setModalClose } = useModal();

	return (
		<Dialog open={isModalOpen || defaultOpen} onOpenChange={setModalClose}>
			<DialogContent className="h-screen overflow-auto bg-card md:h-fit md:max-h-[700px]">
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
