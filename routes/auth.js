const express = require('express');
const { body } = require('express-validator')

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.put('/signup',
[
    body('email').isEmail()
    .withMessage('Please enter valid email')
    .custom((value, {req})=> {
        return User.findOne({email:value}).then(userDoc =>{
            if(userDoc) {
                return Promise.reject('Email Addredd already exists')
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({min:  5}),
    body('name').trim().not().isEmpty()
], authController.signup);

router.post('/login',authController.login);

/* 
router.post('/post',
[
    body('title').trim().isLength({min: 7 }),
    body('content').trim().isLength({min: 5 })
],
feedController.createPost);

router.get('/post/:postId',feedController.getPost);


router.delete('/post/:postId',feedController.deletePost); */

module.exports = router;