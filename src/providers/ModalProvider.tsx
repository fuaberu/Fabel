"use client";

import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";

interface ModalProviderProps {
	children: React.ReactNode;
}

type ModalContextType = {
	isModalOpen: boolean;
	setModalOpen: (modal: React.ReactNode) => void;
	setModalClose: () => void;
};

export const ModalContext = createContext<ModalContextType>({
	isModalOpen: false,
	setModalOpen: (modal: React.ReactNode) => {},
	setModalClose: () => {},
});

const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [showingModal, setShowingModal] = useState<ReactNode | null>(null);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const setModalOpen = async (modal: ReactNode) => {
		setShowingModal(modal);
		setIsModalOpen(true);
	};

	const setModalClose = () => {
		setIsModalOpen(false);
		setShowingModal(null);
	};

	if (!isMounted) return null;

	return (
		<ModalContext.Provider value={{ setModalOpen, setModalClose, isModalOpen }}>
			{children}
			{showingModal}
		</ModalContext.Provider>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within the modal provider");
	}
	return context;
};

export default ModalProvider;
