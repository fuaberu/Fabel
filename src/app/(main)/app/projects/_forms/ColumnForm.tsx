import Spinner from "@/components/global/Spinner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/providers/ModalProvider";
import { ColumnFormSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Props {
	column?: Column;
	create?: (data: z.infer<typeof ColumnFormSchema>) => Promise<void>;
	update?: (data: z.infer<typeof ColumnFormSchema>, id: string) => Promise<void>;
}

const ColumnForm = ({ column, create, update }: Props) => {
	const { setModalClose } = useModal();

	const form = useForm<z.infer<typeof ColumnFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(ColumnFormSchema),
		defaultValues: {
			name: column?.name || "",
			description: column?.description || "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof ColumnFormSchema>) => {
		if (column && update) {
			//	update
			await update(values, column.id);
		} else if (create) {
			//	create
			await create(values);
		}

		setModalClose();
	};

	const [timeOpen, setTimeOpen] = useState(false);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-4">
					<FormField
						disabled={isLoading}
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						disabled={isLoading}
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea placeholder="Description" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<DialogFooter className="sm:justify-start">
					<Button className="mt-4" disabled={isLoading} type="submit">
						{form.formState.isSubmitting ? (
							<div className="flex items-center gap-2">
								<Spinner size="sm" type="secondary" /> {column ? "Updating..." : "Creating..."}
							</div>
						) : column ? (
							"Update"
						) : (
							"Create"
						)}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
};

export default ColumnForm;
