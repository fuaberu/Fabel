import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getTagBgColor } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { ChevronLeft, Edit, Edit2, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import TagComponent from "./TagComponent";
import { Tag, TagColor } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createTagDb, editTagDb } from "../../actions";
import Spinner from "@/components/global/Spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
	tags: Pick<Tag, "id" | "name" | "color">[];
	projectId: string;
	projectTags: Pick<Tag, "id" | "name" | "color">[];
	onCreate: (data: Pick<Tag, "id" | "name" | "color">) => void;
	onEdit: (data: Pick<Tag, "id" | "name" | "color">) => void;
	onSelect: (data: Pick<Tag, "id" | "name" | "color">, checked: boolean) => void;
}

const TagManager = ({ tags, projectId, projectTags, onCreate, onEdit, onSelect }: Props) => {
	const [mode, setMode] = useState<"select" | "create" | "edit">("select");
	const [editId, setEditId] = useState<string | null>(null);
	const [tagName, setTagName] = useState("");
	const [tagColor, setTagColor] = useState<TagColor>(TagColor.GRAY);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const filterdProjectTags = useMemo(() => {
		return projectTags
			.filter((tag) => tag.name.startsWith(tagName))
			.sort((a, b) => a.id.localeCompare(b.id));
	}, [projectTags, tagName]);

	const handleCreate = async () => {
		if (tagName && tagColor) {
			setIsLoading(true);
			const toastId = toast.loading("Creating tag...");

			const response = await createTagDb({
				name: tagName,
				color: tagColor,
				boardId: projectId,
			});

			if (!response.data) {
				toast.error(response.message || "Something went wrong", { id: toastId });
				setIsLoading(false);
				return;
			}

			onCreate(response.data);

			// Reset state
			setTagName("");
			setTagColor(TagColor.GRAY);
			setMode("select");

			toast.success("Tag created", { id: toastId });
		} else {
			toast.error("Tag name and color are required");
		}

		setIsLoading(false);
	};

	const handleEdit = async () => {
		if (editId && tagName && tagColor) {
			setIsLoading(true);
			const toastId = toast.loading("Editing tag...");

			const response = await editTagDb(editId, {
				name: tagName,
				color: tagColor,
				boardId: projectId,
			});

			if (!response.data) {
				toast.error(response.message || "Something went wrong", { id: toastId });
				setIsLoading(false);
				return;
			}

			onEdit(response.data);

			// Reset state
			setTagName("");
			setTagColor(TagColor.GRAY);
			setMode("select");

			toast.success("Tag edited", { id: toastId });
		} else {
			toast.error("Tag name and color are required");
		}

		setIsLoading(false);
	};

	const handleDelete = async () => {
		toast.error("Not implemented");
	};

	const resetState = () => {
		setEditId(null);
		setTagName("");
		setTagColor(TagColor.GRAY);
		setMode("select");
	};

	return (
		<Popover onOpenChange={(o) => !o && resetState()}>
			<PopoverTrigger asChild>
				<Button variant={"outline"} size={"icon"} className="h-8 w-8">
					<Plus />
				</Button>
			</PopoverTrigger>
			<PopoverContent side="right" align="end" sideOffset={-32} alignOffset={40}>
				<div className="flex items-center justify-between">
					<div className={cn("visible", mode === "select" && "invisible")}>
						<Button
							variant={"ghost"}
							size={"icon"}
							className="h-8 w-8"
							onClick={() => {
								if (mode === "edit") {
									setEditId(null);
									setTagName("");
									setTagColor(TagColor.GRAY);
								}
								setMode("select");
							}}
							type="button"
						>
							<ChevronLeft size={18} />
						</Button>
					</div>
					<h4>{mode === "select" ? "Tags" : mode === "create" ? "Create tag" : "Edit tag"}</h4>
					<PopoverClose asChild>
						<Button variant={"ghost"} size={"icon"} className="h-8 w-8" type="button">
							<X size={18} />
						</Button>
					</PopoverClose>
				</div>

				<div className="space-y-3 pt-2">
					{(mode === "create" || mode === "edit") && (
						<>
							<div className="flex justify-center py-4">
								<TagComponent title={tagName} color={tagColor} />
							</div>
							<div>
								<Label htmlFor="tag-name">Name</Label>
								<Input
									id="tag-name"
									placeholder="Name"
									value={tagName}
									onChange={(e) => setTagName(e.target.value)}
								/>
							</div>
							<div>
								<Label>Color</Label>
								<div className="grid grid-cols-6 grid-rows-3 gap-2">
									{Object.values(TagColor).map((c) => (
										<button
											key={c}
											className={cn(
												"h-8 rounded-lg shadow-sm",
												getTagBgColor(c),
												tagColor === c && "outline",
											)}
											type="button"
											onClick={() => setTagColor(c)}
										/>
									))}
								</div>
							</div>
							<div className="flex items-center justify-between">
								<Button
									onClick={() => {
										if (mode === "create") {
											handleCreate();
										} else if (mode === "edit") {
											handleEdit();
										}
									}}
									type="button"
								>
									{isLoading ? (
										<div className="flex items-center gap-2">
											<Spinner size="sm" type="secondary" /> Saving...
										</div>
									) : (
										"Save"
									)}
								</Button>
								<Button
									type="button"
									className={cn("invisible", mode === "edit" && "visible")}
									variant={"destructive"}
									onClick={handleDelete}
								>
									{isDeleting ? (
										<div className="flex items-center gap-2">
											<Spinner size="sm" type="secondary" /> Deleting...
										</div>
									) : (
										"Delete"
									)}
								</Button>
							</div>
						</>
					)}

					{mode === "select" && (
						<>
							<Input
								placeholder="Search tags..."
								value={tagName}
								onChange={(e) => setTagName(e.target.value)}
							/>
							<div>
								<Label>Tags</Label>
								<div className="rounded bg-slate-50 p-2">
									{filterdProjectTags.length > 0 ? (
										<ul className="flex flex-col gap-2">
											{filterdProjectTags.map((tag) => (
												<li key={tag.id}>
													<label htmlFor={tag.id} className="flex w-full items-center gap-2">
														<Checkbox
															id={tag.id}
															value={tag.id}
															checked={!!tags.find((t) => t.id === tag.id)}
															onCheckedChange={(c) => onSelect(tag, !!c)}
														/>
														<div
															className={cn(
																"flex-1 rounded-sm p-2 text-xs",
																getTagBgColor(tag.color),
																"bg-opacity-20",
															)}
														>
															{tag.name}
														</div>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		type="button"
																		variant={"ghost"}
																		size={"icon"}
																		className="h-8 w-8"
																		onClick={() => {
																			setMode("edit");
																			setEditId(tag.id);
																			setTagName(tag.name);
																			setTagColor(tag.color);
																		}}
																	>
																		<Edit2 size={14} />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>
																	<p>Edit</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</label>
												</li>
											))}
										</ul>
									) : (
										<p className="text-center text-xs">No tags found</p>
									)}
								</div>
							</div>
							{projectTags.length < 5 && (
								<Button
									onClick={() => setMode("create")}
									type="button"
									variant={"outline"}
									className="w-full"
								>
									Create tag
								</Button>
							)}
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default TagManager;
