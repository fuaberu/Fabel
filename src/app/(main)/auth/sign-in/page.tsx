import { redirect } from "next/navigation";
import Client from "./_components/Client";
import { auth } from "@/auth";

const Page = () => {
	const session = auth();

	if (session) return redirect("/app");

	return <Client />;
};

export default Page;
