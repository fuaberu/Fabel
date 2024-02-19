import { Board } from "@prisma/client";
import { FC } from "react";
import { useModal } from "@/providers/ModalProvider";
import CustomModal from "@/components/global/CustomModal";
import DeleteProjectForm from "./DeleteProjectForm";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";
import PreferencesForm from "./PreferencesForm";
import GeneralForm from "./GeneralForm";

interface Props {
	board: Board;
}

const SettingsComponent: FC<Props> = ({ board }) => {
	const { setModalOpen } = useModal();

	function handleDeleteProject() {
		setModalOpen(
			<CustomModal title={"Confirm deletion of " + board.name} size="xs">
				<DeleteProjectForm board={board} />
			</CustomModal>,
		);
	}

	return (
		<div className="space-y-2">
			<section className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
				<h3 className="flex-1 whitespace-nowrap text-lg font-medium">Project Settings</h3>
				<GeneralForm board={board} />
			</section>
			<section className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
				<h3 className="flex-1 whitespace-nowrap text-lg font-medium">Preferences</h3>
				<PreferencesForm board={board} />
			</section>
			<section className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
				<h3 className="flex-1 whitespace-nowrap text-lg font-medium">Delete Project</h3>
				<div className="flex-[2] rounded-lg border border-destructive bg-red-950 p-4">
					<div className="flex items-start gap-4">
						<AlertOctagon />
						<div className="flex-1">
							<h4 className="text-white">Deleting this project can not be undone</h4>
							<p className="text-red-500">
								Make sure you have made a backup if you want to keep your data.
							</p>
							<Button
								className="float-right mt-6"
								type="button"
								variant="destructive"
								onClick={handleDeleteProject}
							>
								Delete Project
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default SettingsComponent;