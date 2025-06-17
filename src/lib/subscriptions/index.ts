import { BillingClient } from './client';

if (!AGNOSTIC_API_URI) throw new TypeError('AGNOSTIC_API_URI is not defined');

export const billing = new BillingClient(AGNOSTIC_API_URI);
export type { Subscription } from './client';
export {
	handleSubscriptionRedirect,
	isSubscriptionActive,
	onSubscriptionChange,
	refresh
} from './utils';
