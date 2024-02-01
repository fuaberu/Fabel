import { db } from "@/lib/db";

export const getAllNotifications = async (userId: string) => {
	try {
		const response = await db.notification.findMany({
			where: { userId },
			orderBy: {
				createdAt: "desc",
			},
			take: 50,
		});
		return response;
	} catch (error) {
		console.log(error);
	}
};
