import Spinner from "@/components/global/Spinner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BoardFormSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { Board } from "@prisma/client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	board: Board;
}

const GeneralForm: FC<Props> = ({ board }) => {
	const form = useForm<z.infer<typeof BoardFormSchema>>({
		resolver: zodResolver(BoardFormSchema),
		defaultValues: {
			name: board.name,
		},
	});

	function onSubmit(data: z.infer<typeof BoardFormSchema>) {
		toast.success("sa");
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="m-0 flex-[2] space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between gap-4">
							<div className="space-y-0.5">
								<FormLabel className="whitespace-nowrap text-base">Project name</FormLabel>
							</div>
							<FormControl>
								<Input {...field} />
							</FormControl>
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

export default GeneralForm;
