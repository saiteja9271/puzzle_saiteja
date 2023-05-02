import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    performance:{
        type:'string',
        required:true,
    },
    accuracy:{
        type:'string',
        required:true,
    },
    time:{
        type:'string',
        required:true,
    },
    score:{
        type:'string',
        required:true,
    },
    tokens:[
        {
            token:{
                type:'string',
                required:true,
            }
        }
    ]
});


userSchema.pre('save',async function (next){
 if(this.isModified('password'))
    this.password=await bcrypt.hash(this.password,12);
 next();
});


userSchema.methods.generateAuthtoken = async function (req,res) {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
            expiresIn: "1d"
        });

        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        res.status(422).json(error)
    }
}

const User=mongoose.model('TREASURE',userSchema);
export default User;


