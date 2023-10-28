if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: 'backend/config/info.env' })


const axios = require("axios");
const uuid = require('uuid')
const Order = require('../modals/order')
const SSLCommerzPayment = require('sslcommerz')

exports.processPayment = async (req, res, next) => {
  const tranId = uuid.v4();
  const { user, shippingInfo, totalPrice, order } = req.body;
  const newOrder = await Order.create({ ...order, user: user._id })

  try {
    const data = {
      total_amount: totalPrice,
      currency: "BDT",
      tran_id: tranId,
      success_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
      fail_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
      cancel_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'cust@yahoo.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
      multi_card_name: 'mastercard',
      value_a: 'ref001_A',
      value_b: 'ref002_B',
      value_c: 'ref003_C',
      value_d: 'ref004_D'
    };
    const sslcommer = new SSLCommerzPayment('walma653ca185578b1', 'walma653ca185578b1@ssl', false) //true for live default false for sandbox
    sslcommer.init(data).then(data => {
      //process the response that got from sslcommerz 
      //https://developer.sslcommerz.com/doc/v4/#returned-parameters
      console.log(data)
      res.status(200).json({ url: data.GatewayPageURL });
    });
    // const val = await axios.post(
    //   "https://sandbox.aamarpay.com/jsonpost.php",
    //   {
    //     store_id: "aamarpaytest",
    //     signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
    //     cus_name: user?.name ? user?.name : "Rabi Islam",
    //     cus_email: user?.email ? user?.email : 'islamrabi02@gmail.com',
    //     cus_phone: shippingInfo?.phoneNo ? shippingInfo?.phoneNo : '01748627513',
    //     cus_add1: shippingInfo?.address ? shippingInfo?.address : "Bangladesh",
    //     cus_add2: shippingInfo?.city ? shippingInfo?.city : "Dhaka",
    //     cus_city: shippingInfo?.city ? shippingInfo?.city : "Dhaka",
    //     cus_country: shippingInfo?.country ? shippingInfo?.country : "Dhaka",
    //     amount: totalPrice,
    //     tran_id: tranId,
    //     currency: "BDT",
    //     success_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
    //     fail_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
    //     cancel_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
    //     desc: "Package Bill",
    //     type: "json"
    //   }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // }
    // );
    // console.log(val.data)
    
  } catch (err) {
    console.log(err);
  }
}

exports.paymentCallback = async (req, res, next) => {
  // Callback data
  console.log(req.body);
  const {
    status,
    card_type,
    bank_tran_id,
    tran_id
    
  } = req.body;
  if (status === 'VALID') {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.paymentInfo = {
        customerId: tran_id,
        paymentIntentId: bank_tran_id,
        payment_status: 'paid',
        method: card_type
      }
    }
    await order.save();
    res.redirect("https://walmart12.vercel.app/success")
  }
  else if (status === 'FAILED') {
    await Order.findByIdAndDelete(req.params.id)
    res.redirect("https://walmart12.vercel.app/fail")
  }
  else {
    await Order.findByIdAndDelete(req.params.id)
    res.redirect("https://walmart12.vercel.app/cancel")
  }
}

exports.sendStripeApi = async (req, res, next) => {


  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY
  })
}