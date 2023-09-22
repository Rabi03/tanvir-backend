if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: 'backend/config/info.env' })


const axios = require("axios");
const uuid = require('uuid')
const Order = require('../modals/order')


exports.processPayment = async (req, res, next) => {
  const tranId = uuid.v4();
  const { user, shippingInfo, totalPrice, order } = req.body;
  const newOrder = await Order.create({ ...order, user: user._id })

  try {
    const val = await axios.post(
      "https://sandbox.aamarpay.com/jsonpost.php",
      {
        store_id: "aamarpaytest",
        signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
        cus_name: user?.name ? user?.name : "Rabi Islam",
        cus_email: user?.email ? user?.email : 'islamrabi02@gmail.com',
        cus_phone: shippingInfo?.phoneNo ? shippingInfo?.phoneNo : '01748627513',
        cus_add1: shippingInfo?.address ? shippingInfo?.address : "Bangladesh",
        cus_add2: shippingInfo?.city ? shippingInfo?.city : "Dhaka",
        cus_city: shippingInfo?.city ? shippingInfo?.city : "Dhaka",
        cus_country: shippingInfo?.country ? shippingInfo?.country : "Dhaka",
        amount: totalPrice,
        tran_id: tranId,
        currency: "BDT",
        success_url: `https://tanvir-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
        fail_url: `https://tanvir-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
        cancel_url: `https://tanvir-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
        desc: "Package Bill",
        type: "json"
      }, {
      headers: {
        'Content-Type': 'application/json',
      },
    }
    );
    console.log(val.data)
    res.status(200).json({ url: val.data.payment_url });
  } catch (err) {
    console.log(err);
  }
}

exports.paymentCallback = async (req, res, next) => {
  // Callback data
  // console.log(req.body);
  const {
    pay_status,
    cus_name,
    cus_phone,
    cus_email,
    currency,
    pay_time,
    amount,
  } = req.body;
  if (pay_status === 'Successful') {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.paymentInfo = {
        customerId: cus_name + " , " + cus_email + " , " + cus_phone.toString(),
        paymentIntentId: data.payment_intent,
        payment_status: pay_status,
        method: "amarpay"
      }
    }
    await order.save();
    res.redirect("https://tanvir-frontend.vercel.app/success")
  }
  else if (pay_status === 'Failed') {
    await Order.findByIdAndDelete(req.params.id)
    res.redirect("https://tanvir-frontend.vercel.app/fail")
  }
  else {
    await Order.findByIdAndDelete(req.params.id)
    res.redirect("https://tanvir-frontend.vercel.app/cancel")
  }
}

exports.sendStripeApi = async (req, res, next) => {


  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY
  })
}