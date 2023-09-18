const express=require('express');
const router=express.Router();

const { newOrder, getSingleOrder, myOrders, allOrders, updateOrder, deleteOrder } = require('../controllers/OrderControllers');

const { isUserAuthenticated, authorizedRols } = require('../middleware/auth');



router.route('/order/new').post(isUserAuthenticated,newOrder)
router.route('/order/:id').get(isUserAuthenticated,getSingleOrder)
router.route('/orders/me').get(isUserAuthenticated,myOrders)
router.route('/admin/orders').get(isUserAuthenticated,authorizedRols("admin"),allOrders)
router.route('/admin/order/:id')
                    .put(isUserAuthenticated,authorizedRols("admin"),updateOrder)
                    .delete(isUserAuthenticated,authorizedRols("admin"),deleteOrder)

module.exports = router;