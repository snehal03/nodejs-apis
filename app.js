const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const app  = express();

// file upload/download
const fileStorage = multer.diskStorage({
    destination: (req, file , cb)=>{
        cb(null,'images');
    },
    filename: (req, file , cb)=>{
        cb(null,new Date().toISOString()+'-'+file.originalname);
    }
});

const fileFilter = (req, file , cb)=>{
    if(file.mimeType === 'image/png' 
    || file.mimeType === 'image/jpg' 
    || file.mimeType === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

// END file upload/download


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);

app.use('/images',express.static(path.join(__dirname,'images')));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATHC,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
})

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);

app.use((error,req,res,next) =>{
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data:data});
})

mongoose.connect('mongodb+srv://snehal03:snehal_098@cluster0.vgcfj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority').
then(result=>{
    app.listen(8080);
}).catch(err=>  console.log(err));
