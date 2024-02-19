import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Board } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	board: Board;
}

const DeleteProjectForm: FC<Props> = ({ board }) => {
	const Schema = z.object({
		name: z.literal(board.name, {
			errorMap: () => ({ message: "Value entered does not match project name." }),
		}),
	});

	const form = useForm<z.infer<typeof Schema>>({
		mode: "onBlur",
		resolver: zodResolver(Schema),
		defaultValues: {
			name: "",
		},
	});

	function onSubmit(data: z.infer<typeof Schema>) {
		toast.error("Not Implemented");
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
				<div className="flex gap-4 rounded-md border border-amber-800 bg-amber-700 p-4">
					<AlertTriangle className="text-amber-950" />
					<h4 className="text-white">This action cannot be undone.</h4>
				</div>
				<p>{`This will permanently delete the ${board.name} project and all of its data.`}</p>
				<Separator />
				<h5>
					Type <b className="font-bold">{board.name}</b> to confirm.
				</h5>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full" variant="destructive">
					I understand, delete this project
				</Button>
			</form>
		</Form>
	);
};

export default DeleteProjectForm;
