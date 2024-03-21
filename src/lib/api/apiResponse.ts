export interface ApiResponse {
	data: any | null;
	statusCode: number;
	success?: boolean;
	error?: string | null;
}

export const apiResponse = ({ data, success = true, error, statusCode }: ApiResponse) => {
	return Response.json(
		{
			success,
			error,
			data,
		},
		{
			status: statusCode,
			headers: {
				"Content-Type": "application/json",
			},
			statusText: "OK",
		},
	);
};
