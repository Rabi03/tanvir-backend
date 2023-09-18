const Product = require('../modals/product');

if(process.env.NODE_ENV !== 'production') require('dotenv').config({path:'backend/config/info.env'})
const ConnectDatabase = require('../config/datadase');
const products=require('../data/products.json')

ConnectDatabase()

const seedProducts=async(req,res,next)=>{
    try {
        await Product.deleteMany()
        console.log("Products are deleted successfully")

        await Product.insertMany(products)
        console.log("Products are inserted successfully")
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

seedProducts()