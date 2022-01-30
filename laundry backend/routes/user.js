const bodyParser = require('body-parser');
const express=require('express');
const app=express();
const jwt = require("jsonwebtoken");
const User = require('../models/users');
const router=express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
app.use(bodyParser());
app.use(bodyParser.json());
app.use(express.urlencoded());


router.post('/login',body('string').isEmail(), async function(req,res){
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() });
             }

        const string = req.body.string;
        const password = req.body.password;
        const user = await User.findOne({email : string});
            if(!user){
                return res.status(400).json({
                    status: "failed",
                    message: "User not registered"
                });
            }
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                return res.status(400).json({
                    status:'failed',
                    message:'invalid credentials'
                });
            }else{
                const str=String(user._id);
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    data: str
                }, 'Laundry-Secret-123');
                res.json({
                    status:'success',
                    token
                });
            }
           

    } catch(e){
        res.status(400).json({
            status:'failed',
            message: e.message
        });
    }    
})


router.post('/register', async function(req,res){
    try{
        const {name, email, phone, password, state, district, address, pincode} = req.body;
        const hash=await bcrypt.hash(password,10);
        await User.create({name, email, phone, password : hash, state, district, address, pincode});
        res.json({
            status:'success',
            message:'registration successful'
        });
    } catch(e){
        res.json({
            status:'failed',
            message: e.message
        });
    }
});



module.exports = router;