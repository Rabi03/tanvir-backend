const Cart = require('../modals/cartModal')


exports.createOrUpdateCart = async (req, res, next) => {
    try {
        let cart;
        cart = await Cart.findOne({ user: req.user._id })
        console.log(cart)

        if (cart) {
            cart.orderItems = req.body.orderItems;
            cart.shippingInfo = req.body.shippingInfo;
            cart.itemsPrice = req.body.itemsPrice;
            cart.taxPrice = req.body.taxPrice;
            cart.shippingPrice = req.body.shippingPrice;
            cart.totalPrice = req.body.totalPrice

            await cart.save()
        }
        else {
            cart = await Cart.create({
                ...req.body,
                user: req.user._id
            })
        }

        req.cartId = cart._id
        next()
    }
    catch (e) {
        console.log(e)
        return res.status(400).send({
            success: false,
            error: {
                message: 'Can not create cart for you.Please try again'
            }
        })

    }
}

exports.deleteCart = async (userId) => {
    try {
        const cart = await Cart.deleteOne({ user: userId })

    } catch (error) {
        return res.status(400).send({
            success: false,
            error: {
                message: 'Can not delete cart'
            }
        })
    }

}