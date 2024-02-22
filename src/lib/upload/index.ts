import { ChangeEvent } from "react";
import { toast } from "sonner";

export async function upload(
	{ event, path }: { event: ChangeEvent<HTMLInputElement>; path?: string },
	callbackFn: (url: string) => void
) {
	const file = event.target.files?.[0];

	if (file) {
		const uploadPromise = new Promise((resolve, reject) => {
			const data = new FormData();

			data.set("file", file);
			if (path) {
				data.set("path", path);
			}

			fetch("/api/upload", {
				method: "POST",
				body: data
			}).then((response) => {
				if (response.ok) {
					response.json().then((link) => {
						callbackFn(link);
						resolve(link);
					});
				} else {
					reject();
				}
			});
		});

		toast.promise(uploadPromise, {
			loading: "Uploading...",
			success: "File uploaded",
			error: "Error uploading File. Try again later."
		});
	}
}
