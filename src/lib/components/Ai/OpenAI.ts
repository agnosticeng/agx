interface ModelsResponse {
	object: 'list';
	data: AIModel[];
}

interface AIModel {
	object: 'model';
	id: string;
	created: number;
	owned_by: string;
}

interface ChatCompletionInput {
	model: string;
	messages: ChatMessage[];
	stream?: boolean | undefined;
	frequency_penalty?: number | undefined;
	max_completion_tokens?: number | undefined;
	presence_penalty?: number | undefined;
	temperature?: number | undefined;
	top_p?: number | undefined;
}

interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

interface ChatCompletionOutput {
	object: 'chat.completion';
	model: string;
	id: string;
	created: number;
	system_fingerprint: string;
	choices: ChatCompletionChoice[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

interface ChatCompletionChoice {
	message: {
		role: 'assistant';
		content: string;
	};
	index: number;
	finish_reason: 'length' | 'stop' | 'content_filter';
}

interface RequestOptions {
	signal?: AbortSignal;
	fetch?: typeof fetch;
	token?: string | null;
}

export class OpenAIClient {
	private readonly baseUrl: string;
	private readonly headers: Headers;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
		this.headers = new Headers({ 'Content-Type': 'application/json' });
	}

	async listModels(options: RequestOptions = {}) {
		options.fetch ??= fetch;

		const response = await options.fetch(`${this.baseUrl}/v1/models`, {
			headers: this.headers,
			signal: options.signal
		});
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const data = (await response.json()) as ModelsResponse;
		return data.data;
	}

	async createChatCompletion(input: ChatCompletionInput, options: RequestOptions = {}) {
		options.fetch ??= fetch;

		const headers = new Headers(this.headers);
		if (options.token) {
			headers.set('Authorization', 'Bearer ' + options.token);
		}

		const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
			method: 'POST',
			headers,
			body: JSON.stringify(input),
			signal: options.signal
		});

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const data = (await response.json()) as ChatCompletionOutput;
		return data;
	}
}
