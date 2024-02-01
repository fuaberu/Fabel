import React from "react";
import MenuOptions from "./MenuOptions";
import { auth } from "@/auth";

const Sidebar = async () => {
	const user = auth();

	if (!user) return null;

	return (
		<>
			<MenuOptions defaultOpen={true} />
			<MenuOptions />
		</>
	);
};

export default Sidebar;
