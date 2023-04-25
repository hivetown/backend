export interface PopulateOptions<T> {
	// TODO: for deep keyof: https://stackoverflow.com/a/43922291
	//  or https://stackoverflow.com/a/58436959
	populate?: (keyof T)[];
}
