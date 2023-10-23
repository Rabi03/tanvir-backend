const express=require('express');
const Products=require('./routes/Product')
const User=require('./routes/User')
const Order=require('./routes/Order')
const Payment=require('./routes/Payment')
const Stripe=require("./routes/Stripe")
const Messages=require("./routes/messages")
const cookieParser= require('cookie-parser')
const bodyParser= require('body-parser')
const cloudinary=require('cloudinary')
const fileUpload=require('express-fileupload')
const path=require('path')
const socket = require("socket.io");
const morgan = require("morgan");
const cors = require("cors");


process.on('uncaughtException', err=>{
    console.log(err.stack)
    console.log('Server is sutting down due to uncaught exception')
    process.exit(1)
})

const ConnectDatabase = require('./config/datadase');
const errorMiddleware = require('./middleware/error');
require('dotenv').config()



const app=express();
app.use(cors());
app.use("/",Stripe)
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())
app.use(morgan("dev"))
const { corsProOptions } = require("./config/corsConfig");

app.get("/",(req,res)=>{
    res.send("Hello World")
})
app.use('/api/v1',Products)
app.use('/api/v1',User)
app.use('/api/v1',Order)
app.use('/api/v1',Payment)
app.use('/api/v1/messages',Messages)


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
  });

app.use(errorMiddleware)
ConnectDatabase();

const server=app.listen(5000,()=>console.log(`Server is running on Port: 5000`))

process.on('unhandledRejection',err=>{
    console.log(err)
    console.log('Server is sutting down due to unhandled rejection')
    server.close(()=>process.exit(1))
})

const io = socket(server, {
    cors: {
      origin: "https://walmart12.vercel.app",
      credentials: true,
    },
  });
  
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    });
  });