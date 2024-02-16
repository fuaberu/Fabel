"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { LoginSchema } from "@/schemas/auth";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { login } from "../actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import Spinner from "@/components/global/Spinner";

const Client = () => {
	const router = useRouter();

	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		startTransition(() => {
			const id = toast.loading("loading...");

			login(values)
				.then((data) => {
					if (data.success) {
						router.push("/app");

						form.reset();
						toast.success(data.success, { id });
					} else if (data.message) {
						toast.success(data.message, { id });
						form.reset();
					} else if (data.error) {
						toast.error(data.error, { id });
					} else {
						toast.dismiss(id);
					}
				})
				.catch((error) => {
					toast.error("Something went wrong. Please try again later", { id });
				});
		});
	};

	return (
		<div className="flex h-[100svh] w-full items-center justify-center p-2">
			<Card className="w-full max-w-sm">
				<CardHeader>Login</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
							<div className="space-y-2">
								<>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isPending}
														placeholder="john.doe@example.com"
														type="email"
														autoComplete="username"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isPending}
														placeholder="******"
														type="password"
														autoComplete="current-password"
													/>
												</FormControl>
												<Button size="sm" variant="link" asChild className="px-0 font-normal">
													<Link href="/auth/reset">Forgot password?</Link>
												</Button>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							</div>
							<Button disabled={isPending} type="submit" className="w-full">
								{isPending ? (
									<div className="flex items-center gap-2">
										<Spinner size="sm" /> Loading
									</div>
								) : (
									"Continue"
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Client;
