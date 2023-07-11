export function raise(message: string): never;
export function raise(condition: any, message: string): asserts condition;

export function raise(messageOrCondition: any, message?: string): asserts messageOrCondition {
	if (!message) {
		throw new Error(String(messageOrCondition));
	}

	if (!messageOrCondition) {
		throw new Error(message);
	}

	return;
}
