const mongoose=require('mongoose');

console.log("MongoDb url",process.env.MONGODB)

const ConnectDatabase=()=>{
    mongoose.connect(process.env.MONGODB,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((con)=>console.log(`Mongodb connectd with host: ${con.connection.host}`))
}

module.exports=ConnectDatabase;