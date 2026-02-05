const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session for new student signup
async function createCheckoutSession(studentEmail, studentName) {
    const session = await stripe.checkout.sessions.create({
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
          cancel_url: `${process.env.NEXT_PUBLIC_URL}?canceled=true`,
          metadata: { studentName, studentEmail },
    });
    return session;
}

// Check if student has active subscription
async function checkSubscriptionStatus(customerEmail) {
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (customers.data.length === 0) return { active: false };

  const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        limit: 1,
  });
    return { active: subscriptions.data.length > 0, customerId: customers.data[0].id };
}

// Create billing portal session
async function createPortalSession(customerId) {
    const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });
    return session;
}

module.exports = { createCheckoutSession, checkSubscriptionStatus, createPortalSession };
