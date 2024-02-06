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
import { TaskFormSchema } from "@/schemas/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

interface Props {
	columnId?: string;
	task?: Task;
	create?: (data: z.infer<typeof TaskFormSchema>, columnId: string) => Promise<void>;
	update?: (data: z.infer<typeof TaskFormSchema>, id: string) => Promise<void>;
}

const TaskForm = ({ columnId, task, create, update }: Props) => {
	const { setModalClose } = useModal();

	const form = useForm<z.infer<typeof TaskFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(TaskFormSchema),
		defaultValues: {
			name: task?.name || "",
			description: task?.description || "",
			dueDate: task?.dueDate?.toISOString().slice(0, 19) || "",
		},
	});

	const isLoading = form.formState.isLoading;

	const onSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
		if (task && update) {
			//	update
			await update(values, task.id);
		} else if (columnId && create) {
			//	create
			await create(values, columnId);
		}

		setModalClose();
	};

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
					<FormField
						disabled={isLoading}
						control={form.control}
						name="dueDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Due Date</FormLabel>
								<FormControl>
									<Input type="datetime-local" {...field} />
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
								<Spinner size="sm" /> {task ? "Updating" : "Creating"}
							</div>
						) : task ? (
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

export default TaskForm;
