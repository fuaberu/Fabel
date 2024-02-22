"use client";

import { UserGeneralSettingsSchema } from "@/schemas/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateGeneralUserSettings } from "../action";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/global/Spinner";
import { User } from "@prisma/client";
import { FC } from "react";
import DeleteForm from "@/components/global/DeleteForm";
import CustomModal from "@/components/global/CustomModal";
import { useModal } from "@/providers/ModalProvider";
import { AlertOctagon } from "lucide-react";

interface Props {
	user: User;
}
const GeneralForm: FC<Props> = ({ user }) => {
	const { setModalOpen } = useModal();

	function handleDeleteAccount() {
		setModalOpen(
			<CustomModal title={"Confirm deletion of your account"} size="xs">
				<DeleteForm
					action={() => new Promise(() => console.log("del"))}
					message="Are you sure you want to delete your account?"
					typeToDelete={user.name}
					understandMessage="I understand, delete my account"
				/>
			</CustomModal>,
		);
	}

	const form = useForm<z.infer<typeof UserGeneralSettingsSchema>>({
		resolver: zodResolver(UserGeneralSettingsSchema),
		defaultValues: {
			name: user.name,
			email: user.email || "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof UserGeneralSettingsSchema>) => {
		const id = toast.loading("loading...");

		try {
			const data = await updateGeneralUserSettings(values);

			if (data.success) {
				toast.success(data.success, { id });
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
		<div className="space-y-4">
			<section className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
				<h3 className="flex-1 whitespace-nowrap text-lg font-medium">General</h3>
				<div className="flex-[2]">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="space-y-2">
								<>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isLoading}
														placeholder="John Doe"
														autoComplete="name"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
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
								</>
							</div>
							<div className="float-right flex gap-2">
								<Button type="button" variant={"secondary"} onClick={() => form.reset()}>
									Cancel
								</Button>
								<Button disabled={form.formState.isSubmitting} type="submit">
									{form.formState.isSubmitting ? (
										<div className="flex items-center gap-2">
											<Spinner size="sm" type="secondary" /> Updating...
										</div>
									) : (
										"Update"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</section>
			<section className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
				<h3 className="flex-1 whitespace-nowrap text-lg font-medium">Delete Project</h3>
				<div className="flex-[2] rounded-lg border border-destructive bg-red-950 p-4">
					<div className="flex items-start gap-4 text-white">
						<AlertOctagon />
						<div className="flex-1">
							<h4>Deleting this account can not be undone</h4>
							<p className="text-red-500">
								Make sure you have made a backup if you want to keep your data.
							</p>
							<Button
								type="button"
								variant="destructive"
								className="float-right mt-6"
								onClick={handleDeleteAccount}
							>
								Delete Account
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default GeneralForm;
