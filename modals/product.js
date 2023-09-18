const mongoose = require('mongoose');

const productSchema=mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter product name"],
        trim: true,
        maxlength:[100,"Product name cannot exceed 100 characters"]
    },
    price:{
        type: Number,
        required: [true,"Please enter product price"],
        maxlength:[5,"Product price cannot exceed 5 characters"],
        default:0.0
    },
    description:{
        type: String,
        required: [true,"Please enter product description"]
    },
    rating:{
        type: Number,
        default:0
    },
    images:[
        { 
            public_id:{
                type: String,
                required:true,
            },
            url:{
                type: String,
                required:true,
            }
        }
    ],
    category:{
        type:String,
    },
    seller:{
        type:String,
        required:[true,"Please enter seller name"],
    },
    stock:{
        type:Number,
        required:[true,"Please enter product stock number"],
        maxlength:[5,"Product stock cannot exceed 5 characters"]
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            },
            avatar:{
                type:String,
                required:true,
            },
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true,
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true,

    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports =mongoose.model('Product',productSchema)