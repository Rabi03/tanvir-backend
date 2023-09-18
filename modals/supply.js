const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    paymentInfo: {
        from: {
          type: String,
          require: [true, "Please Provide Receiver Account Id!"],
        },
        balance_transfered: {
          type: Number,
          require: [true, "Please Provide Transfered Balance!"],
          min: [50, "You Can Not Transfer Balance Less Than 50 BDT"],
        },
        createdAt:{
            type:Date
        },
        id:{
            type:String
        }
      },

      createdAt:{
        type:Date,
        default:Date.now()
      }

})

module.exports = mongoose.model('Supply', orderSchema)