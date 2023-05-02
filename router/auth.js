import express from 'express';
import User from '../module/Userschema.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authenticate from '../aut/Authenticate.js'
import { Long } from 'mongodb';
const route=express.Router();

route.get('/get-users',async (req,res)=>{
    const users = await User.find();
    res.send({
        data: users
    })
})
route.post("/register",async (req,res)=>{
    console.log(req.body)
    const {name,email,password,performance,accuracy,time,score}=req.body;
    if(!name || !email || !password)
    return res.status(422).json({status:422,error:"please enter the field correctly"});
    try{
    const userExist= await User.findOne({email:email});
    if(userExist){
    console.log("user exist")
    return res.status(421).json({status:421,error:"email already exist"});
    }
    const user=new User({name,email,password,performance,accuracy,time,score})
   

    const userRegister=await user.save();
    if(userRegister)
    res.status(201).json({status:201,message:"successfully registered"})
    }
    catch(err){
        console.log(err)
    }  
})

route.post("/signin",async (req,res)=>{
    try{
    const {email,password}=req.body;
    let token;
    if(!email || !password)
    return res.status(400).json({error:"invlaid credentials"});
   const userLogin=await User.findOne({email:email});
    if(userLogin)
   {
    const isMatch=await bcrypt.compare(password,userLogin.password);

    if(!isMatch)
         res.status(400).json({status:400,error:"invalid credentials"})
    else
    {
        console.log("Hello from login")
         token = await userLogin.generateAuthtoken();
        console.log("this is token",token)
                // cookiegenerate
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });
              console.log("cookies set")
                const result = {
                    userLogin,
                    token
                }
                res.status(201).json({status:201,result})
        
    }
  }
   else
    res.status(400).json({status:200,error:"invalid credentials"})
   

    }
    catch(err)
    {
        console.log(err);
    }
})


route.get('/about',authenticate,async (req,res)=>{
    try {
        const validUser = await User.findOne({_id:req.userId});
        res.status(201).json({status:201,validUser});
    } catch (error) {
        res.status(401).json({status:401,error});
    }
})
route.patch('/update',authenticate,async (req,res)=>{
    console.log("this is from update page")
    console.log(req.body)
    const {name,email,performance,accuracy,time,score}=req.body;
    try {
        // const validUser = await User.findOne({email:email});
        console.log("entered into update page")
        await User.findOneAndUpdate({email:email},{$set:{name,email,performance,accuracy,time,score}})
        res.status(201).json({status:201,msg:"successfully updated"});
    } catch (error) {
        res.status(401).json({status:401,msg:"error in udpate"});
    }
})

route.get("/logout",authenticate,async(req,res)=>{
    try {
        req.rootUser.tokens =  req.rootUser.tokens.filter((elem)=>{
            return elem.token !== req.token
        });

        res.clearCookie("usercookie",{path:"/"});

        req.rootUser.save();

        res.status(201).json({status:201})

    } catch (error) {
        res.status(401).json({status:401,error})
    }
})




export default route;




