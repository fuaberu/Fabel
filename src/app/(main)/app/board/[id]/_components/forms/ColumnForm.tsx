"use client";

import { useState } from "react";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Column } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnFormSchema } from "@/schemas/board";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/global/Spinner";
import { Plus } from "lucide-react";

interface Props {
	submitAction: (arg0: z.infer<typeof ColumnFormSchema>) => Promise<void>;
}

const ColumnForm: React.FC<Props> = ({ submitAction }) => {
	const [isOpen, setIsOpen] = useState(false);
	const form = useForm<z.infer<typeof ColumnFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(ColumnFormSchema),
		defaultValues: {
			name: "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof ColumnFormSchema>) => {
		await submitAction({
			name: values.name,
		});
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" className="flex h-14 items-center gap-2">
					<Plus size={15} />
					Create Column
				</Button>
				{/* <Button variant="outline">New Column</Button> */}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create a Column</DialogTitle>
					<DialogDescription>Columns allow you to group tasks.</DialogDescription>
				</DialogHeader>
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
						</div>
						<DialogFooter className="sm:justify-start">
							<Button className="mt-4" disabled={isLoading} type="submit">
								{form.formState.isSubmitting ? (
									<div className="flex items-center gap-2">
										<Spinner size="sm" /> {"Creating"}
									</div>
								) : (
									"Create"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default ColumnForm;
