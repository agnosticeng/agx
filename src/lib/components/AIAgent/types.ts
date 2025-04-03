export interface ChatInput {
	messages: {
		role: 'user' | 'assistant' | 'system' | 'tool';
		content: string;
	}[];
	stream?: false | undefined;
}

export interface ChatOutput {
	created_at: string;
	message: { role: 'assistant'; content: string };
}
