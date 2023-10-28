if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: 'backend/config/info.env' })


const axios = require("axios");
const uuid = require('uuid')
const Order = require('../modals/order')

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = 'sust63616e0a0b0a8'
const store_passwd = 'sust63616e0a0b0a8@ssl'
const is_live = false //true for live, false for sandbox

exports.processPayment = async (req, res, next) => {
  const tranId = uuid.v4();
  const { user, shippingInfo, totalPrice, order } = req.body;
  const newOrder = await Order.create({ ...order, user: user._id })

  try {
    const data = {
        cus_name: user?.name ? user?.name : "Rabi Islam",
        cus_email: user?.email ? user?.email : 'islamrabi02@gmail.com',
        cus_phone: shippingInfo?.phoneNo ? shippingInfo?.phoneNo : '01748627513',
        cus_add1: shippingInfo?.address ? shippingInfo?.address : "Bangladesh",
        cus_add2: shippingInfo?.city ? shippingInfo?.city : "Dhaka",
        cus_city: shippingInfo?.city ? shippingInfo?.city : "Dhaka",
        cus_country: shippingInfo?.country ? shippingInfo?.country : "Dhaka",
        total_amount: totalPrice,
        tran_id: tranId,
        currency: "BDT",
        success_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
        fail_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
        cancel_url: `https://walmart-backend.vercel.app/api/v1/payment/callback/${newOrder._id}`,
        ship_name: user?.name ? user?.name : "Rabi Islam",
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
        
      
    }
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        console.log(GatewayPageURL)
        
        res.status(200).json({ url: GatewayPageURL });
    });
    
    
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
        paymentIntentId: cus_email+pay_time,
        payment_status: pay_status,
        method: "amarpay"
      }
    }
    await order.save();
    res.redirect("https://walmart12.vercel.app/success")
  }
  else if (pay_status === 'Failed') {
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