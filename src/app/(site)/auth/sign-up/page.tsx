import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import Form from "./_components/Form";
import { Button } from "@/components/ui/button";

const Page = async ({ searchParams }: { searchParams: { plan: string } }) => {
	const session = await auth(true);

	if (session) return redirect("/app");

	if (searchParams.plan) {
		return redirect(`/billing?plan=${searchParams.plan}`);
	}

	return (
		<div className="flex h-[100svh] w-full items-center justify-center p-2">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-2xl font-bold">Register</CardHeader>
				<CardContent>
					<Form />
				</CardContent>
				<CardFooter>
					<p className="w-full text-right">
						Already have an account?{" "}
						<Button variant="link" className="p-0" asChild>
							<Link href="/auth/sign-in">Sign in</Link>
						</Button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Page;
