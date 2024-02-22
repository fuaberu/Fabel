import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	typeToDelete: string;
	message: string;
	understandMessage: string;
	action: () => Promise<{ message: string } | any>;
}

const DeleteForm: FC<Props> = ({ message, typeToDelete, understandMessage, action }) => {
	const Schema = z.object({
		deleteString: z.literal(typeToDelete, {
			errorMap: () => ({ message: "Value entered does not match." }),
		}),
	});

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			deleteString: "",
		},
	});

	async function onSubmit(data: z.infer<typeof Schema>) {
		try {
			const res = await action();

			toast.success(res.message || "Action completed successfully!");
		} catch (error) {
			toast.error("Something went wrong. Please try again later");
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
				<div className="flex gap-4 rounded-md border border-orange-800 bg-orange-500 p-4">
					<AlertTriangle className="text-amber-950" />
					<h4 className="text-white">This action cannot be undone.</h4>
				</div>
				<p>{message}</p>
				<Separator />
				<h5>
					Type <b className="font-bold">{typeToDelete}</b> to confirm.
				</h5>
				<FormField
					control={form.control}
					name="deleteString"
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
					{understandMessage}
				</Button>
			</form>
		</Form>
	);
};

export default DeleteForm;
