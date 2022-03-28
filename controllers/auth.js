const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = (req,res,next)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation Failed data is incoreect');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    console.log(email,password,name)
    bcrypt.hash(password, 12)
    .then(hashPw=> {
        const user = new User({
            email: email,
            password: hashPw,
            name: name
        });
        return user.save();
    })
    .then(result=>{
        res.status(200).json({
            message:'User created successfully',
            userId: result._id
        })
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;
            err.data = err;
        }
        next(err);
    }) 
}


exports.login = (req,res,next)=> {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email}).then(user => {
        if(!user) {
            const error = new Error('User with this email not found.');
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password,loadedUser.password)
    })
    .then((isEqual)=>{
        if(!isEqual) {
            const error = new Error('Wrong password entered');
            error.statusCode = 404;
            throw error;
        }
        const token = jwt.sign({
            email:email, 
            userId: loadedUser._id.toString()
        },'secretKey',{ expiresIn: '1h' });
        res.status(200).json({
            message:'User fetched',
            token: token,
            userId: loadedUser._id.toString()
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};