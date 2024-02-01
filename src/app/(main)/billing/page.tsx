import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import clsx from "clsx";
import { auth } from "@/auth";
import { Subscription } from "@prisma/client";

type Props = {
	params: { agencyId: string };
};

const Page = async ({ params }: Props) => {
	//CHALLENGE : Create the add on  products
	// const addOns = await stripe.products.list({
	//   ids: addOnProducts.map((product) => product.id),
	//   expand: ['data.default_price'],
	// })
	const user = auth();

	let subscription: Subscription | null = null;
	if (user) {
		subscription = await db.subscription.findFirst({
			where: {
				userId: user.id,
				OR: [
					{
						currentPeriodEndDate: null,
					},
					{
						currentPeriodEndDate: {
							gte: new Date(),
						},
					},
				],
			},
		});
	}

	const prices = await stripe.prices.list({
		product: process.env.NEXT_PLURA_PRODUCT_ID,
		active: true,
	});

	const charges = await stripe.charges.list({
		limit: 50,
		customer: subscription?.customerId,
	});

	const allCharges = [
		...charges.data.map((charge) => ({
			description: charge.description,
			id: charge.id,
			date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
				charge.created * 1000,
			).toLocaleDateString()}`,
			status: "Paid",
			amount: `$${charge.amount / 100}`,
		})),
	];

	return (
		<>
			{/* <SubscriptionHelper
				prices={prices.data}
				customerId={subscription?.customerId || ""}
				planExists={subscription?.Subscription?.active === true}
			/> */}
			<h1 className="p-4 text-4xl">Billing</h1>
			<Separator className=" mb-6" />
			<h2 className="p-4 text-2xl">Current Plan</h2>
			<div className="flex flex-col justify-between gap-8 lg:!flex-row">
				{/* <PricingCard
					planExists={subscription?.Subscription?.active === true}
					prices={prices.data}
					customerId={subscription?.customerId || ""}
					amt={
						subscription?.Subscription?.active === true
							? currentPlanDetails?.price || "$0"
							: "$0"
					}
					buttonCta={
						subscription?.Subscription?.active === true ? "Change Plan" : "Get Started"
					}
					highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@plura-app.com"
					highlightTitle="Plan Options"
					description={
						subscription?.Subscription?.active === true
							? currentPlanDetails?.description || "Lets get started"
							: "Lets get started! Pick a plan that works best for you."
					}
					duration="/ month"
					features={
						subscription?.Subscription?.active === true
							? currentPlanDetails?.features || []
							: currentPlanDetails?.features ||
								pricingCards.find((pricing) => pricing.title === "Starter")?.features ||
								[]
					}
					title={
						subscription?.Subscription?.active === true
							? currentPlanDetails?.title || "Starter"
							: "Starter"
					}
				/> */}
				{/* {addOns.data.map((addOn) => (
          <PricingCard
            planExists={subscription?.Subscription?.active === true}
            prices={prices.data}
            customerId={subscription?.customerId || ''}
            key={addOn.id}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `$${addOn.default_price.unit_amount / 100}`
                : '$0'
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={'24/7 priority support'}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long long with the click of a button."
          />
        ))} */}
			</div>
			<h2 className="p-4 text-2xl">Payment History</h2>
			<Table className="rounded-md border-[1px] border-border bg-card">
				<TableHeader className="rounded-md">
					<TableRow>
						<TableHead className="w-[200px]">Description</TableHead>
						<TableHead className="w-[200px]">Invoice Id</TableHead>
						<TableHead className="w-[300px]">Date</TableHead>
						<TableHead className="w-[200px]">Paid</TableHead>
						<TableHead className="text-right">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="truncate font-medium">
					{allCharges.map((charge) => (
						<TableRow key={charge.id}>
							<TableCell>{charge.description}</TableCell>
							<TableCell className="text-muted-foreground">{charge.id}</TableCell>
							<TableCell>{charge.date}</TableCell>
							<TableCell>
								<p
									className={clsx("", {
										"text-emerald-500": charge.status.toLowerCase() === "paid",
										"text-orange-600": charge.status.toLowerCase() === "pending",
										"text-red-600": charge.status.toLowerCase() === "failed",
									})}
								>
									{charge.status.toUpperCase()}
								</p>
							</TableCell>
							<TableCell className="text-right">{charge.amount}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</>
	);
};

export default Page;
