import jwt from 'jsonwebtoken';
import user from '../module/Userschema.js'

const Authenticate =async(req,res,next)=>{

try {
  console.log("iam getting eerror here")
  const token = req.headers.authorization;
  console.log("this is token from auth:",token,"keyll:",process.env.SECRET_KEY)
  const verifytoken = jwt.verify(token,process.env.SECRET_KEY);
  console.log("verify",verifytoken)
  const rootUser = await user.findOne({_id:verifytoken._id});
  console.log("thisis root user",rootUser)
  if(!rootUser) {throw new Error("user not found")}

  req.token = token
  req.rootUser = rootUser
  req.userId = rootUser._id

  next();

} catch (error) {
  res.status(401).json({status:401,message:"Unauthorized no token provide"})
}
}


export default Authenticate;