import { redirect } from "next/navigation";
import Client from "./_components/client";
import { auth } from "@/auth";

const Page = async ({ searchParams }: { searchParams: { plan: string } }) => {
	const session = auth();

	if (session) return redirect("/app");

	if (searchParams.plan) {
		return redirect(`/billing?plan=${searchParams.plan}`);
	}

	return <Client />;
};

export default Page;
