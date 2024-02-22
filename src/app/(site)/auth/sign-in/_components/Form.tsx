"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import Spinner from "@/components/global/Spinner";

const FormComponent = () => {
	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
		const id = toast.loading("loading...");

		try {
			const data = await login(values);

			if (data.success) {
				toast.success(data.success, { id });

				form.reset();
			} else if (data.error) {
				toast.error(data.error, { id });
			} else {
				toast.dismiss(id);
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again later", { id });
		}
	};

	return (
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
											disabled={isLoading}
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
											disabled={isLoading}
											placeholder="******"
											type="password"
											autoComplete="current-password"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				</div>
				<Button disabled={isLoading} type="submit" className="w-full">
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Spinner type="secondary" size="sm" /> Loading
						</div>
					) : (
						"Continue"
					)}
				</Button>
			</form>
		</Form>
	);
};

export default FormComponent;
