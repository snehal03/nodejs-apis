const { validationResult } = require('express-validator')
const Posts = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req,res,next)=> {
    Posts.find().then(posts => {
        if(!posts) {
            const error = new Error('Could not found posts');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message:'Posts fetched',
            posts: posts
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.createPost = (req,res,next)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation Failed data is incoreect');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.image;
    let creator ;
 

  /*   if(!req.file) {
        const error = new Error('No Image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path; */

  const post = new Posts({
        title: title ,
        content:content,
        imageUrl : imageUrl,
        creator: req.userId
    });
    post.save()
    .then(result => {
        return User.findById(req.userId);
    })
    .then((user)=> {
        creator = user;
        user.posts.push(post);
        return user.save;
    })
    .then((result)=>{
        res.status(201).json({
            message:'Post created successfully',
            post: post,
            creator: {_id: creator._id, name: creator.name}
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }) 
}


exports.getPost = (req,res,next)=> {
    const postId = req.params.postId;

    Posts.findById(postId).then(post => {
        if(!post) {
            const error = new Error('Could not found post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message:'Post fetched',
            post: post
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}


exports.updatePost = (req,res,next)=> {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.image;

    Posts.findById(postId).then(post => {
        if(!post) {
            const error = new Error('Could not found post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorize');
            error.statusCode = 404;
            throw error;
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    }).then(result => {
        res.status(200).json({
            message:'Post updated',
            post: result
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}


exports.deletePost = (req,res,next)=> {
    const postId = req.params.postId;
        
    Posts.findById(postId).then(post => {
        if(!post) {
            const error = new Error('Could not found post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator && post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorize');
            error.statusCode = 404;
            throw error;
        }
        return Posts.findByIdAndRemove(postId);

    }).then(result => {
       return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        res.status(200).json({
            message:'Post Deleted'
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}
