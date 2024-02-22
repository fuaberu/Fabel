import { auth } from "@/auth";
import GeneralForm from "./_forms/GeneralForm";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const page = async () => {
	const user = await auth();

	const userDb = await db.user.findUnique({
		where: {
			id: user.id,
		},
	});

	if (!userDb) redirect("/");

	return <GeneralForm user={userDb} />;
};

export default page;
