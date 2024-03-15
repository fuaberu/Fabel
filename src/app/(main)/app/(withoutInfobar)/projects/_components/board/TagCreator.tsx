"use client";

import React, { useMemo, useState } from "react";
import { Tag, TagColor } from "@prisma/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, TrashIcon, X } from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import TagComponent from "./TagComponent";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type Props = {
	defaultTags?: Pick<Tag, "id" | "name" | "color">[];
};

const colors: TagColor[] = ["GRAY", "BLUE", "ORANGE", "ROSE", "PURPLE", "GREEN"];

const TagCreator = ({ defaultTags }: Props) => {
	const [tags, setTags] = useState(defaultTags || []);

	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState(colors[0]);

	const handleCreate = () => {
		setTags((prev) => [...prev, { id: newTagName, name: newTagName, color: newTagColor }]);
	};

	const handleDelete = (id: string) => {
		setTags((prev) => prev.filter((tag) => tag.id !== id));
	};

	const filterdTags = useMemo(() => {
		return tags
			.filter((tag) => tag.name.startsWith(newTagName))
			.sort((a, b) => (a.name > b.name ? 1 : -1));
	}, [tags, newTagName]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={"outline"} size={"icon"} className="h-8 w-8">
					<Plus />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add new tag</DialogTitle>
					<DialogDescription>
						With tags you can easily organize your tasks. You can add up to 5 tags.
					</DialogDescription>
				</DialogHeader>
				<div className="my-2 flex items-center gap-2">
					{colors.map((color) => (
						<Checkbox
							key={color}
							checked={newTagColor === color}
							color={color}
							onCheckedChange={() => setNewTagColor(color)}
						/>
					))}
				</div>
				<div className="relative">
					<Input
						placeholder="Search for tag..."
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
					/>
					{newTagName.length > 0 && !tags.find((tag) => tag.name === newTagName) && (
						<Button
							variant={"outline"}
							size={"icon"}
							type="button"
							className="absolute right-0 top-1/2 -translate-y-1/2"
							onClick={handleCreate}
						>
							<Plus />
						</Button>
					)}
				</div>
				<div className="flex flex-col gap-2">
					{filterdTags.map((tag) => (
						<div key={tag.id} className="flex items-center justify-between">
							<TagComponent title={tag.name} color={tag.color} />
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant={"destructive"} size={"icon"} className="h-8 w-8">
										<TrashIcon size={18} />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete the tag.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={() => handleDelete(tag.id)}>
											Confirm
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TagCreator;
