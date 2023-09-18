const mongoose = require('mongoose');

const cartSchema=mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    orderItems:[
        {
            name:{
                type: String,
                required: true,
            },
            quantity:{
                type: Number,
                required: true,
            },
            image:{
                public_id:{
                    type: String,
                },
                url:{
                    type: String,
                }
            },
            price:{
                type: Number,
                required: true,
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref:'Product'
            }
        }
    ],
    shippingInfo:{
        address: {
            type: String,
            
        },
        city: {
            type: String,
            
        },
        country: {
            type: String,
            
        },
        phoneCode:{
            type: String,
            
        },
        phoneNumber: {
            type: String,
            
        },
        zipCode:{
            type:String
        }
    },
    itemsPrice:{
        type: Number,
        required: true,
        default:0.0
    },
    taxPrice:{
        type: Number,
        required: true,
        default:0.0
    },
    shippingPrice:{
        type: Number,
        required: true,
        default:0.0
    },
    totalPrice:{
        type: Number,
        required: true,
        default:0.0
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
})

module.exports =mongoose.model('Cart',cartSchema)