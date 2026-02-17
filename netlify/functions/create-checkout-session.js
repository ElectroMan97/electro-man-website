const Stripe = require("stripe");

exports.handler = async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { cart } = JSON.parse(event.body);

  const line_items = cart.map(item => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name },
      unit_amount: item.price * 100,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "Local Pickup",
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 1500, currency: "usd" },
          display_name: "Standard Shipping",
        },
      },
    ],
    success_url: "https://yourdomain.netlify.app/success.html",
    cancel_url: "https://yourdomain.netlify.app/cancel.html",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url }),
  };
};
