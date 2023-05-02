// This is a helper function to throw an error in a cleaner way
// for one-liners
// example: user.id === 1 || throwError(new ForbiddenError('Only user 1 can do this'))
export const throwError = (error: Error) => {
	throw error;
};
