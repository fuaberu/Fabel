export const smallDateTime = (date: Date): string => {
	const config: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

	// check if date is today add the hours to the configuration
	if (date.toDateString() === new Date().toDateString()) {
		config.hour = "numeric";
		config.minute = "numeric";
	}

	return date.toLocaleString("default", config);
};

export const getUTCTime = (dateTimeString: string | undefined | null): Date | null => {
	if (!dateTimeString) return null;

	const dateTime = new Date(dateTimeString);
	const dateTimeNumber = dateTime.getTime();
	const dateTimeOffset = dateTime.getTimezoneOffset() * 60000;
	const dateTimeUTC = new Date();
	dateTimeUTC.setTime(dateTimeNumber - dateTimeOffset);

	return dateTimeUTC;
};
