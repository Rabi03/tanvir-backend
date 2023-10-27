const Order = require('../modals/order')
const Product = require('../modals/product')


exports.newOrder = async (req, res, next) => {

    try {

        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body


        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id
        })

        res.status(200).json({
            success: true,
            order
        })



    } catch (error) {
        return res.status(400).send({
            success: false,
            error: {
                message: error.message,
            }
        })
    }

}

exports.getSingleOrder = async (req, res, next) => {
    try {

        const order = await Order.findById(req.params.id).populate('user', 'name email')

        res.status(200).json({
            success: true,
            order
        })

    } catch (error) {
        return res.status(404).send({
            success: false,
            error: {
                message: "No Order found with this ID"
            }
        })

    }
}

exports.myOrders = async (req, res, next) => {

    const orders = await Order.find({ user: req.user.id })

    res.status(200).json({
        success: true,
        orders
    })
}


exports.allOrders = async (req, res, next) => {

    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.updateOrder = async (req, res, next) => {

    try {

        const order = await Order.findById(req.params.id)

        if (order.orderStatus === 'Delivered') {
            return res.status(400).send({
                success: false,
                error: {
                    message: 'Order has already been delivered'
                }
            })
        }

        order.orderItems.forEach(async item => {
            await UpdateStock(item.product, item.quantity)
        })

        order.orderStatus = req.body.status
        order.deliverAt = Date.now()
        if (req.body.status === 'Delivered')
            order.paymentInfo.payment_status = 'paid'

        await order.save()

        res.status(200).json({
            success: true
        })
    } catch (error) {
        console.log(error.message)
        return res.status(400).send({
            error: error.message
        })
    }

}

exports.updateOrderPayInfo = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        order.paymentInfo.payment_status = req.body.status;
        order.paidAt = Date.now()
        await order.save()

        res.status(200).json({
            success: true
        })
    } catch (error) {
        console.log(error.message)
        return res.status(400).send({
            error: error.message
        })
    }
}

async function UpdateStock(id, quantity) {
    const product = await Product.findById(id)

    product.stock = product.stock - quantity

    await product.save({ validateBeforeSave: false })
}


exports.deleteOrder = async (req, res, next) => {
    try {

        const order = await Order.findById(req.params.id)

        await order.remove()

        res.status(200).json({
            success: true
        })

    } catch (error) {
        return res.status(404).send({
            success: false,
            error: {
                message: "No Order found with this ID"
            }
        })

    }
}