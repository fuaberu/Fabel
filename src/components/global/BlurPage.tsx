import { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

const BlurPage = ({ children }: Props) => {
	return (
		<>
			<div
				className="absolute inset-0 left-[300px] z-[-1] h-[100svh] overflow-y-auto bg-muted/60 p-4 pt-24 backdrop-blur-[35px] dark:bg-muted/40 dark:shadow-2xl dark:shadow-black"
				id="blur-page"
			></div>
			{children}
		</>
	);
};

export default BlurPage;
