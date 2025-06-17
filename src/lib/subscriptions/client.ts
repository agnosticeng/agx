export type BillingClientOptions = {
	token: string;
};

export interface Subscription {
	id: number;
	email: string;
	createdAt: Date;
	endAt: Date | null;
	providerCustomerId: string;
	providerSubscriptionId: string;
}

type JSONSubscription = Omit<Subscription, 'createdAt' | 'endAt'> & {
	createdAt: string;
	endAt?: string | null;
};

export class BillingClient {
	constructor(private baseUrl: string) {}

	async getSubscription({ token }: BillingClientOptions) {
		const url = new URL('/billing/api/subscriptions', this.baseUrl);

		const response = await fetch(url, { method: 'GET', headers: this.headers(token) });
		if (!response.ok) return null;

		const json = (await response.json()) as JSONSubscription;

		const subscription: Subscription = {
			...json,
			createdAt: new Date(json.createdAt),
			endAt: json.endAt ? new Date(json.endAt) : null
		};

		return subscription;
	}

	async createCheckoutSession({ token }: BillingClientOptions) {
		const url = new URL('/billing/api/checkout/session', this.baseUrl);

		const response = await fetch(url, { method: 'POST', headers: this.headers(token) });

		if (!response.ok) {
			console.error(await response.text());
			return null;
		}

		const json = (await response.json()) as { session_url: string };
		return json.session_url;
	}

	async getCheckoutSession(sessionId: string, { token }: BillingClientOptions) {
		const url = new URL(`/billing/api/checkout/session/${sessionId}`, this.baseUrl);
		const response = await fetch(url, { method: 'GET', headers: this.headers(token) });

		if (!response.ok) return null;

		return await response.json();
	}

	async getCustomerPortal({ token }: BillingClientOptions) {
		const url = new URL('/billing/api/customer/portal', this.baseUrl);

		const response = await fetch(url, { method: 'GET', headers: this.headers(token) });
		if (!response.ok) return null;

		const { portal_url } = (await response.json()) as { portal_url: string };

		return portal_url;
	}

	private headers(token: string) {
		const headers = new Headers();
		headers.set('Authorization', `Bearer ${token}`);
		headers.set('Accept', 'application/json');

		return headers;
	}
}
