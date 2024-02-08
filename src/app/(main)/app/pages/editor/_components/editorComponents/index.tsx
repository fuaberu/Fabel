import { EditorElement } from "@/providers/EditorProvider";
import Text from "./Text";

interface Props {
	element: EditorElement;
}

const EditorComponentCreator = ({ element }: Props) => {
	switch (element.type) {
		case "text":
			return <Text element={element} />;
		default:
			return null;
	}
};

export default EditorComponentCreator;
