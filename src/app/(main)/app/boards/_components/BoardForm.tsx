"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { BoardFormSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBoardDb } from "../../projects/actions";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/global/Spinner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	userId: string;
}

const BoardForm = ({ userId }: Props) => {
	const pathname = usePathname();

	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<z.infer<typeof BoardFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(BoardFormSchema),
		defaultValues: {
			name: "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof BoardFormSchema>) => {
		const res = await createBoardDb({ ...values, user: { connect: { id: userId } } }, pathname);

		if (res) {
			setIsOpen(false);
			form.reset();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger className="rounded-md ring-primary duration-200 hover:scale-[1.02] hover:ring-2">
				<Card className="h-44 w-80 bg-card/60">
					<CardHeader>
						<CardTitle>Create New Board</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-center gap-2">
						<Plus /> Board
					</CardContent>
				</Card>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create a New Board</DialogTitle>
					{/* <DialogDescription>Columns allow you to group tasks.</DialogDescription> */}
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

export default BoardForm;
