import EditorSidebar from "./_components/EditorSidebar";

const Layout = () => {
	return (
		<div className="fixed bottom-0 left-0 right-0 top-0 z-[20] overflow-hidden bg-background">
			{/* <EditorProvider
        subaccountId={params.subaccountId}
        funnelId={params.funnelId}
        pageDetails={funnelPageDetails}
      >
        <FunnelEditorNavigation
          funnelId={params.funnelId}
          funnelPageDetails={funnelPageDetails}
          subaccountId={params.subaccountId}
        /> */}
			<div className="flex h-full justify-center">
				{/* <FunnelEditor funnelPageId={params.funnelPageId} /> */}
			</div>

			<EditorSidebar />
			{/* </EditorProvider> */}
		</div>
	);
};

export default Layout;
