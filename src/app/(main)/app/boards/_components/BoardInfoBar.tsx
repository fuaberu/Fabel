"use client";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Board } from "@prisma/client";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
	id: string;
	boards: Board[];
};

const BoardInfoBar = ({ id, boards }: Props) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(id);

	return (
		<div>
			<div className="flex items-end gap-2">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							{value ? boards.find((board) => board.id === value)?.name : "Select a pipeline..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0">
						<Command>
							<CommandEmpty>No boards found.</CommandEmpty>
							<CommandGroup>
								{boards.map((board) => (
									<Link key={board.id} href={`/app/boards/${board.id}`}>
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
									Create Board
								</Button>
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

export default BoardInfoBar;
