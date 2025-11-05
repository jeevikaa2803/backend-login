const express=require('express')
const cors=require('cors')
const bodyparser=require('body-parser')
require('dotenv').config({path:'./configuration/.env'})
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser')
const  mongoose=require('mongoose')
const app=express();

//middleware setup
app.use(cors({
    origin:'https://login-signup-frontend-phi.vercel.app',
    credentials:true,
    methods:["GET",'POST',"PUT","DELETE"]
}
))
app.use(express.json())

//setup middleware cookie parser
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

//mongoose connect
mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log("connected"))
.catch(()=>console.log("errr"))

//model&schema
const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const userModel=mongoose.model('user',userSchema)
// app.get('/', (req,res)=>{
//     res.json({name:"jeevi"})
// })
//sign up
app.post('/signup', async(req ,res)=>{
    const{name,email,password}=req.body;
    
    let user=await userModel.findOne({email:email});
    console.log(user)
        if(user)
        {
            res.json({err:"email already registered"})
        }
        else{
                let hashpassword=await bcrypt.hash(password,10);
                const user=await userModel.create({name,email,password:hashpassword})
                console.log(user)
                res.json({message:"register successfully"})
        }
    
    //hash()

})

//login
app.post('/login', async(req,res)=>{
    const {name,email,password}=req.body;

    let user=await userModel.findOne({email:email});

   
    if(user){

        await bcrypt.compare(password,user.password,(err,response)=>{
            if(err)
            {
                     res.json({message:"password incorrect"})
            }
            if(response)
            {
                let token=jwt.sign({email:user.email},"vcx")
                console.log(token)
                res.cookie("token",token)
                res.json({message:"success"})
            }

        })


        // if(user.password==password){
            
        // }
        // else{
       
        // }
    }
    else{
        res.json({message:"user not found"})
    }
})

const verifyToken=(req,res,next)=>{
    let token=req.cookies.token;
    console.log(token)
    if(token){
        jwt.verify(token,'vcx',(err,decoded)=>{

            if(err)
            {
                return res.json({message:"token invalid"})
            }
            else{
                req.email=decoded.email;
                next()
            }
        })

    }

}

app.get('/dashboard',verifyToken,(req,res)=>{
return res.json({email:req.email})

})

module.exports=app
