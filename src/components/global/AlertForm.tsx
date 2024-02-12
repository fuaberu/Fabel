import { FC, useState } from "react";
import { Button } from "../ui/button";
import { useModal } from "@/providers/ModalProvider";
import Spinner from "./Spinner";

interface Props {
	action: () => Promise<void>;
	description: string;
}

const AlertForm: FC<Props> = ({ action, description }) => {
	const { setModalClose } = useModal();

	const [loading, setLoading] = useState(false);

	return (
		<div>
			{description && <p>{description}</p>}
			<div className="flex items-center justify-end gap-2">
				<Button
					variant="destructive"
					onClick={async () => {
						setLoading(true);
						await action();
						setLoading(false);
						setModalClose();
					}}
				>
					{loading ? (
						<div className="flex items-center gap-2">
							<Spinner size="sm" type="secondary" /> Loading...
						</div>
					) : (
						"Confirm"
					)}
				</Button>
				<Button onClick={setModalClose}>Cancel</Button>
			</div>
		</div>
	);
};

export default AlertForm;
