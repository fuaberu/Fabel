import { auth } from "@/auth";
import Navigation from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const NotFound = async () => {
	const session = await auth();

	if (!session) redirect("/");

	return (
		<main className="w-full pt-44">
			<Navigation />
			<div className="mx-auto w-full max-w-md space-y-6 text-center">
				<h2 className="text-2xl font-bold">Sorry, the page can&apos;t be found</h2>
				<p className="font-medium">
					The page you were looking for appears to have been moved, deleted or does not exist.
				</p>
				<Link className="flex items-center justify-center gap-3" href={"/app"}>
					<Button>
						<ArrowLeft />
						<span>{"back to the App"}</span>
					</Button>
				</Link>
			</div>
		</main>
	);
};

export default NotFound;
