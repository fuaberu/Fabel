import Spinner from "@/components/global/Spinner";

const Loading = () => {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<Spinner size="lg" />
		</div>
	);
};

export default Loading;
