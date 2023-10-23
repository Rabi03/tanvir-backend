const express = require("express");
const Stripe = require("stripe");
const Order = require('../modals/order')
const Cart = require("../modals/cartModal")
const { isUserAuthenticated } = require("../middleware/auth");
const { createOrUpdateCart, deleteCart } = require("../controllers/CartControllers");
// require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);

const router = express.Router();

router.post("/stripe/create-checkout-session", express.json({ type: "application/json" }), isUserAuthenticated, createOrUpdateCart, async (req, res) => {
    
  if (req.cartId) {
    console.log("Cart", req.cartId.toString())
    const customer = await stripe.customers.create({
      metadata: {
        userId: JSON.stringify(req.user?._id),
        cart: JSON.stringify(req.cartId)
      },
    });

    const line_items = req.body.orderItems.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image.url],
            // description: item.desc,
            metadata: {
              id: item.id,
            },
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      shipping_options:[{
        shipping_rate_data:{
          type:"fixed_amount",
          fixed_amount:{amount:(req.body.shippingPrice+req.body.taxPrice)*100,currency:'usd'},
          display_name:"Include tax charges $"+req.body.taxPrice
        }

      }],
      customer: customer.id,
      success_url: `https://walmart12.vercel.app/success`,
      cancel_url: `https://walmart12.vercel.app/cancel`,
    });


    // res.redirect(303, session.url);
    res.send({ url: session.url });
  }
  else {
    console.log(req.cartId)
    return res.status(400).send({
      success: false,
      error: {
        message: 'Something went wrong.Please try again later.'
      }
    })
  }

});

const createOrder = async (customer, data) => {
    console.log("Create order")

  const cart = JSON.parse(customer.metadata.cart);

  const cartItems = await Cart.findById(cart);



  const newOrder = await Order.create({
    shippingInfo: cartItems.shippingInfo,
    orderItems: cartItems.orderItems,
    paymentInfo: {
      customerId: data.customer,
      paymentIntentId: data.payment_intent,
      payment_status: data.payment_status,
      method:"Card"
    },
    itemsPrice:cartItems.itemsPrice,
    taxPrice:cartItems.taxPrice,
    shippingPrice:cartItems.shippingPrice,
    totalPrice:cartItems.totalPrice,
    user: JSON.parse(customer.metadata.userId)
  })

  await deleteCart(JSON.parse(customer.metadata.userId))

  try {
    console.log("Processed Order:", newOrder);
  } catch (err) {
    console.log(err);
  }

}

// Stripe webhoook

router.post(
  "/stripe/webhook",
  express.raw({ type: "*/*" }),
  async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    let webhookSecret;
    webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
        console.log("Webhook Veified")
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed:  ${err}`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    console.log("Event data", data)
    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {

      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          console.log("customer", customer)
          try {
            // CREATE ORDER
            createOrder(customer, data);
            
          } catch (err) {
            console.log(typeof createOrder);
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }
    if (eventType === "checkout.session.async_payment_failed") {
      console.log("Payment Failed")
    }
    if (eventType === "checkout.session.expired") {
      console.log("Payment Expired")
    }
    if (eventType === "payment_intent.canceled") {
      console.log('Canceled')
    }

    res.status(200).end();
  }
);

module.exports = router;