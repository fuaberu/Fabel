import EditorProvider from "@/providers/EditorProvider";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import EditorNavigation from "../_components/EditorNavigation";
import { cookies } from "next/headers";
import ClientEditor from "../_components/ClientEditor";

const page = async ({ params }: { params: { pageId: string } }) => {
	const pageDetails = await db.page.findUnique({ where: { id: params.pageId } });

	if (!pageDetails) {
		return redirect("/app/pages");
	}

	const layout = cookies().get("react-resizable-panels:layout");

	let defaultLayout = [70, 30];
	if (layout) {
		defaultLayout = JSON.parse(layout.value);
	}

	return (
		<>
			<EditorNavigation pageDetails={pageDetails} />
			<EditorProvider pageDetails={pageDetails}>
				<ClientEditor defaultLayout={defaultLayout} />
			</EditorProvider>
		</>
	);
};

export default page;
