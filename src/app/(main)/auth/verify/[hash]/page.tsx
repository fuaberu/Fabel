import { getUserByEmail } from "@/auth/data/user";
import { getVerificationTokenByToken } from "@/auth/data/verification-token";
import { db } from "@/lib/db";
import React from "react";

const Page = async ({ params }: { params: { hash: string } }) => {
	const existingToken = await getVerificationTokenByToken(params.hash);

	if (!existingToken) {
		return <Status message="Token does not exist!" />;
	}

	const hasExpired = new Date(existingToken.expires) < new Date();

	if (hasExpired) {
		return <Status message="Token has expired!" />;
	}

	const existingUser = await getUserByEmail(existingToken.email);

	if (!existingUser) {
		return <Status message="Email not found!" />;
	}

	await db.user.update({
		where: { id: existingUser.id },
		data: {
			emailVerified: new Date()
		}
	});

	await db.verificationToken.delete({
		where: { id: existingToken.id }
	});

	return <Status message="Email verifyed" />;
};

const Status = ({ message, status }: { message: string; status?: string }) => {
	return <div>{message}</div>;
};

export default Page;
