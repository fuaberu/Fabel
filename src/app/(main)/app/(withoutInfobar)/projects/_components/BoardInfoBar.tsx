"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Board } from "@prisma/client";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
	id: string;
	boards: Board[];
};

const BoardInfoBar = ({ id, boards }: Props) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(id);

	return (
		<div className="xs:max-w-64 flex w-full min-w-0 max-w-[130px] items-end gap-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full min-w-0 justify-between"
					>
						<span className="min-w-0 truncate">
							{value ? boards.find((board) => board.id === value)?.name : "Select a pipeline..."}
						</span>

						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandEmpty>No projects found.</CommandEmpty>
						<CommandGroup>
							{boards.map((board) => (
								<Link key={board.id} href={`/app/projects/${board.id}`}>
									<CommandItem
										key={board.id}
										value={board.id}
										onSelect={(currentValue) => {
											setValue(currentValue);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === board.id ? "opacity-100" : "opacity-0",
											)}
										/>
										{board.name}
									</CommandItem>
								</Link>
							))}
							<Button variant="secondary" className="mt-4 flex w-full gap-2">
								<Plus size={15} />
								Create Project
							</Button>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default BoardInfoBar;
