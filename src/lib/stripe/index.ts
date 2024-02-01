import Stripe from "stripe";

declare global {
	var stripe: Stripe | undefined;
}

export const stripe =
	globalThis.stripe ||
	new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
		apiVersion: "2023-10-16",
		appInfo: {
			name: "Plura App",
			version: "0.1.0",
		},
	});

if (process.env.NODE_ENV !== "production") globalThis.stripe = stripe;
