import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
	const session = await auth();

	if (!session) return redirect("/site");

	return (
		<div className="relative h-full">
			<h1 className="text-4xl">Dashboard</h1>
			<Separator className=" my-6" />
			<h2>Hello {session.name}</h2>
		</div>
	);
};

export default Page;
