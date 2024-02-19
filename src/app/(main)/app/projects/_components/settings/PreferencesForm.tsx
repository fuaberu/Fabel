import Spinner from "@/components/global/Spinner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProjectPreferencesSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { Board, ProjectPages } from "@prisma/client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateBoardDb } from "../../actions";

interface Props {
	board: Board;
}

const PreferencesForm: FC<Props> = ({ board }) => {
	const form = useForm<z.infer<typeof ProjectPreferencesSchema>>({
		resolver: zodResolver(ProjectPreferencesSchema),
		defaultValues: {
			defaultPage: board.defaultPage,
		},
	});

	async function onSubmit(data: z.infer<typeof ProjectPreferencesSchema>) {
		try {
			await updateBoardDb(board.id, data, board.defaultPage);
			toast.success("Project preferences updated successfully");
		} catch (error) {
			toast.error("Erro updating project preferences");
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="m-0 flex-[2] space-y-4">
				<FormField
					control={form.control}
					name="defaultPage"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between gap-4">
							<div className="space-y-0.5">
								<FormLabel className="whitespace-nowrap text-base">Default page</FormLabel>
							</div>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a verified email to display" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{[ProjectPages.BOARD, ProjectPages.CALENDAR].map((page) => (
										<SelectItem key={page} value={page}>
											{page}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormItem>
					)}
				/>
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
	);
};

export default PreferencesForm;
