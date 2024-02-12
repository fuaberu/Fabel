export const kanbanBuckets = [
	{
		label: "To Do",
		facts: [
			{ uid: "One", content: "Fact One" },
			{ uid: "Two", content: "Fact Two" },
			{ uid: "Three", content: "Fact Three" },
		],
	},
	{
		label: "In Progress",
		facts: [
			{ uid: "Four", content: "Fact Four" },
			{ uid: "Five", content: "Fact Five" },
			{ uid: "Six", content: "Fact Six" },
		],
	},
	{
		label: "Done",
		facts: [
			{ uid: "Seven", content: "Fact Seven" },
			{ uid: "Eight", content: "Fact Eight" },
			{ uid: "Nine", content: "Fact Nine" },
		],
	},
];

export const getBucketLabels = (buckets: any[]) => {
	return buckets.reduce((acc, bucket) => {
		acc[bucket.label] = true;
		return acc;
	}, {});
};

export const getIdToFactMap = (buckets: any[]) => {
	return buckets.reduce((acc, bucket) => {
		bucket.facts.forEach((fact: { uid: string | number }) => {
			acc[fact.uid] = fact;
		});
		return acc;
	}, {});
};

export const getInitialBucketsData = (buckets: any[]) => {
	return {
		buckets,
		mapIdToFact: getIdToFactMap(buckets),
		bucketLabels: getBucketLabels(buckets),
	};
};
