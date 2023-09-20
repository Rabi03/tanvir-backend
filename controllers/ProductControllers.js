const Product=require('../modals/product')
const ErrorHandler=require('../utils/HandleError')
const catchAsyncError=require('../middleware/catchAsyncError')
const ApiFeatures= require('../utils/ApiFeatures')
const cloudinary = require("cloudinary");


// Create new product
exports.newProduct=async(req,res,next)=>{

    try {
    let imagesLinks = [];

    for (let i = 0; i < req.body.images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(req.body.images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks

    req.body.user = req.user.id
    
    const product=await Product.create(req.body)
    console.log("product",product)

    res.status(201).json({
        success: true,
        product
    })
    } catch (error) {
        console.log("error",error)
        return res.status(400).send({
            error:error.message
        })
    }
    

}

// Get Products
exports.getProducts=async(req,res,next)=>{

    try {
        const resPerPage=8
        const productCount=await Product.countDocuments()
    const apiFeatures=new ApiFeatures(Product.find(),req.query)
        .search()
        .filter()
    
    let p=await apiFeatures.query;
    let filteredProductsCount=p.length;
    
    const newApiFeatures =new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .resPerPage(resPerPage)
    const products=await newApiFeatures.query;
    res.status(200).json({
        success:true,
        productCount,
        resPerPage,
        filteredProductsCount,
        products
    })
    } catch (error) {
        return res.status(400).send({
            error:error
        })
    }
    
}

exports.getAdminProducts=async(req, res, next) => {
    const products=await Product.find();

    res.status(200).json({
        success:true,
        products
    })
}

exports.getSellerProducts=async(req, res, next) => {
    const products=await Product.find({user:req.user._id});

    res.status(200).json({
        success:true,
        products
    })
}

// Get Single Product
exports.getSingleProduct=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.params.id).populate("user")
    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }

    res.status(200).json({
        success:true,
        product
    })
})

// Update Product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product=await Product.findById(req.params.id)
    if(!product) {
        return next(new ErrorHandler('Product not found',404))
    }

    if(req.body.images !== undefined) {
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imagesLinks = [];

    for (let i = 0; i < req.body.images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(req.body.images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks
    }

    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    })
})


// Delete Product
exports.deleteProduct=catchAsyncError(async(req, res, next) => {
    let product=await Product.findById(req.params.id)
    if(!product) {
        return next(new ErrorHandler('Product not found',404))
    }

    for (let i = 0; i < product.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    await product.remove()

    res.status(200).json({
        success:true,
        message: 'Product is deleted successfully'
    })
})


exports.createProductReviews=async(req, res, next) => {

    const {rating,comment,productId}=req.body

    const review={
        user:req.user._id,
        avatar:req.user.avatar.url,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product=await Product.findById(productId);


    
    
    const isReviewed=product.reviews.length>0? product.reviews.find(
        r=>r.user.toString()===req.user._id.toString()
    ):false

    if(isReviewed){

        product.reviews.forEach(review=>{
            if(review.user.toString()===req.user._id.toString()){
                review.comment=comment
                review.rating=Number(rating)
            }
        })
    }
    else{
        product.reviews.push(review)
        product.numberOfReviews=product.reviews.length
    }

    product.rating=product.reviews.reduce((acc,item)=>item.rating+acc,0)/product.reviews.length

    await product.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
    })
}

exports.getProductReviews=async(req, res, next) => {
    const product=await Product.findById(req.query.id)

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
}

exports.deleteReview=async(req, res, next) => {

    const product=await Product.findById(req.query.productId)

    const reviews=product.reviews.filter(review=>review._id.toString() !== req.query.id.toString())

    const numberOfReviews=reviews.length

    const rating=product.reviews.reduce((acc,item)=>item.rating+acc,0)/reviews.length

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        numberOfReviews,
        rating
    },{
        use:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
    })
}