import Stripe from 'stripe';

let _stripe;
function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export function stripe() {
  return getStripe();
}

// Create checkout session for new student signup
export async function createCheckoutSession(studentEmail, studentName) {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: studentEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'ASA Enrollment Fee' },
          unit_amount: 350000, // $3,500
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'ASA Monthly Membership' },
          unit_amount: 49700, // $497
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/?canceled=true`,
    metadata: { studentName, studentEmail },
  });
  return session;
}

// Check if student has active subscription
export async function checkSubscriptionStatus(customerEmail) {
  const customers = await getStripe().customers.list({
    email: customerEmail,
    limit: 1,
  });
  if (customers.data.length === 0) return { active: false };

  const subscriptions = await getStripe().subscriptions.list({
    customer: customers.data[0].id,
    status: 'active',
    limit: 1,
  });
  return {
    active: subscriptions.data.length > 0,
    customerId: customers.data[0].id,
  };
}

// Create billing portal session
export async function createPortalSession(customerId) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });
  return session;
}
