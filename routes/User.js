const express=require('express');
const router=express.Router();

const {registerUser,loginUser, logOut,forgotPassword, resetPassword, getCurrentUserProfile, updatePassword, updateProfile, allUsers, getUserDetails, updateUser, deleteUser, addSupply, getAllSupply, updateSupply, getAdmin} = require('../controllers/UserControllers');
const { isUserAuthenticated, authorizedRols } = require('../middleware/auth');

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logOut)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)

router.route('/me').get(isUserAuthenticated,getCurrentUserProfile)
router.route('/password/update').put(isUserAuthenticated,updatePassword)
router.route('/me/update').put(isUserAuthenticated,updateProfile)
router.route('/getAdmin').get(getAdmin)
router.route('/allUsers').get(allUsers)

router.route('/admin/users').get(isUserAuthenticated,authorizedRols("admin"),allUsers)
router.route('/admin/user/:id')
                        .get(isUserAuthenticated,authorizedRols("admin"),getUserDetails)
                        .put(isUserAuthenticated,authorizedRols("admin"),updateUser)
                        .delete(isUserAuthenticated,authorizedRols("admin"),deleteUser)

                        
router.route('/admin/supply').post(isUserAuthenticated,authorizedRols("admin"),addSupply)
router.route('/supply/orders').get(isUserAuthenticated,authorizedRols("seller"),getAllSupply)
router.route('/supply/order/:id').put(isUserAuthenticated,authorizedRols("seller"),updateSupply)

module.exports =router;