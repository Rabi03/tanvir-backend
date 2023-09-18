const express=require('express');
const { getProducts,newProduct ,getSingleProduct,updateProduct,deleteProduct, createProductReviews, getProductReviews, deleteReview, getAdminProducts} = require('../controllers/ProductControllers');
const { isUserAuthenticated, authorizedRols } = require('../middleware/auth');
const router=express.Router();

router.route('/products').get(getProducts);
router.route('/admin/product/new').post(isUserAuthenticated,authorizedRols("admin"),newProduct);
router.route('/product/:id').get(getSingleProduct);
router.route('/admin/product/:id').put(isUserAuthenticated,authorizedRols("admin"),updateProduct).delete(isUserAuthenticated,authorizedRols("admin"),deleteProduct);
router.route('/admin/products').get(isUserAuthenticated,authorizedRols("admin"),getAdminProducts);

router.route('/review').put(isUserAuthenticated,createProductReviews)
router.route('/reviews').get(isUserAuthenticated,getProductReviews)
                        .delete(isUserAuthenticated,deleteReview)

module.exports=router;