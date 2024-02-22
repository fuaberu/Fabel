"use client";

import React, { useState } from "react";
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
import { PlusCircleIcon, TrashIcon, X } from "lucide-react";
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

type Props = {
	defaultTags?: Tag[];
};

const colors: TagColor[] = ["BLUE", "ORANGE", "ROSE", "PURPLE", "GREEN"];

const TagCreator = ({ defaultTags }: Props) => {
	const [tags, setTags] = useState(defaultTags || []);

	return (
		<AlertDialog>
			<Command className="bg-transparent">
				{defaultTags && !!defaultTags.length && (
					<div className="flex flex-wrap gap-2 rounded-md border-2 border-border bg-background p-2">
						{defaultTags.map((tag) => (
							<div key={tag.id} className="flex items-center">
								<TagComponent title={tag.name} color={tag.color} />
								<X size={14} className="cursor-pointer text-muted-foreground" />
							</div>
						))}
					</div>
				)}
				<div className="my-2 flex items-center gap-2">
					{colors.map((color) => (
						<TagComponent key={color} title="" color={color} />
					))}
				</div>
				<div className="relative">
					<CommandInput placeholder="Search for tag..." />
					<PlusCircleIcon
						size={20}
						className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer text-muted-foreground transition-all hover:text-primary"
					/>
				</div>
				<CommandList>
					<CommandSeparator />
					<CommandGroup heading="Tags">
						{tags.map((tag) => (
							<CommandItem
								key={tag.id}
								className="flex cursor-pointer items-center justify-between !bg-transparent !font-light hover:!bg-secondary"
							>
								<div>
									<TagComponent title={tag.name} color={tag.color} />
								</div>

								<AlertDialogTrigger>
									<TrashIcon
										size={16}
										className="cursor-pointer text-muted-foreground transition-all  hover:text-rose-400"
									/>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle className="text-left">
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription className="text-left">
											This action cannot be undone. This will permanently delete your the tag and
											remove it from our servers.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter className="items-center">
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction className="bg-destructive">Delete Tag</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</CommandItem>
						))}
					</CommandGroup>
					<CommandEmpty>No results found.</CommandEmpty>
				</CommandList>
			</Command>
		</AlertDialog>
	);
};

export default TagCreator;
