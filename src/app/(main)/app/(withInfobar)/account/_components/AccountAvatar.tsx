"use client";

import { UserSession } from "@/auth";
import Spinner from "@/components/global/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { upload } from "@/lib/upload";
import { ChangeEvent, FC, useState } from "react";
import { toast } from "sonner";
import { updateUserImage } from "../action";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
	session: UserSession;
}

const AccountAvatar: FC<Props> = ({ session }) => {
	const [avatar, setAvatar] = useState(session.image || "");
	const [avatarLoaded, setAvatarLoaded] = useState<"idle" | "loading" | "loaded" | "error">(
		"loading",
	);

	const handleAvatarImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return console.error("no files");

		if (!e.target.files[0]) return console.error("no files");

		if (e.target.files.length > 1) return toast.error("Only one file accepted");

		if (e.target.files[0].size > 2e6) return toast.error("Max file size accepted is 2mb");

		if (e.target.files[0].type.split("/")[0] !== "image")
			return toast.error("Only images are accepted");

		setAvatarLoaded("loading");
		await upload({ event: e, path: `avatars/${session.id}/avatar` }, async (link) => {
			setAvatar(link);

			await updateUserImage(link).then((res) => {
				if (res.error) {
					toast.error(res.error);
				}

				if (res.success) {
					toast.success(res.success);
				}
			});
		});
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className="rounded-full">
					{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
					<label className="cursor-pointer overflow-hidden rounded-full">
						<input
							onChange={handleAvatarImageChange}
							type="file"
							accept="image/*"
							className="hidden"
						/>
						<Avatar className="h-32 w-32 shadow">
							<AvatarImage
								src={avatar}
								onLoadingStatusChange={(s) => {
									setAvatarLoaded(s);
								}}
							/>
							<AvatarFallback>
								{avatarLoaded === "loading" && (
									<div className="flex h-full w-full items-center justify-center">
										<Spinner type="primary" size="md" />
									</div>
								)}

								{avatarLoaded === "error" &&
									session.name
										.split(" ")
										.reduce(
											(prev, curr, index, arr) =>
												index === 0 || index === arr.length - 1
													? prev + curr[0].toUpperCase()
													: prev,
											"",
										)}
							</AvatarFallback>
						</Avatar>
					</label>
				</TooltipTrigger>
				<TooltipContent>
					<p>Update profile picture</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default AccountAvatar;
