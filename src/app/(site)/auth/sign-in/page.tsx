import { redirect } from "next/navigation";
import Form from "./_components/Form";
import { auth } from "@/auth";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Page = async () => {
	const session = await auth(true);

	if (session) return redirect("/app");

	return (
		<div className="flex h-[100svh] w-full items-center justify-center p-2">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-2xl font-bold">Login</CardHeader>
				<CardContent>
					<Form />
				</CardContent>
				<CardFooter>
					<div className="w-full">
						<p className="w-full text-right">
							Don&apos;t have an account?{" "}
							<Button variant="link" className="p-0" asChild>
								<Link href="/auth/sign-up">Sign up</Link>
							</Button>
						</p>

						{/* <p className="w-full text-right">
							<Button variant="link" className="p-0" asChild>
								<Link href="/auth/reset">Forgot password?</Link>
							</Button>
						</p> */}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Page;
