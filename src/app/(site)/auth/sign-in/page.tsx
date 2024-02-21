import { redirect } from "next/navigation";
import Form from "./_components/Form";
import { auth } from "@/auth";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";

const Page = async () => {
	const session = await auth(true);

	if (session) return redirect("/app");

	return (
		<div className="flex h-[100svh] w-full items-center justify-center p-2">
			<Card className="w-full max-w-sm">
				<CardHeader>Login</CardHeader>
				<CardContent>
					<Form />
				</CardContent>
				<CardFooter>
					<p className="w-full text-right">
						Don&apos;t have an account?{" "}
						<Link href="/auth/sign-up" className="underline">
							Sign up
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Page;
