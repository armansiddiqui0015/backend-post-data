const express = require('express');
const app = express();
const path = require('path')
const userModel = require('./models/user')
const postModel = require('./models/post');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')))

app.get('/' ,(req,res) =>{
    res.render('index')
})

app.get('/login' ,(req,res) =>{
    res.render('login')
})

app.get('/logout' ,(req,res) =>{
    res.cookie('token', '')
    res.redirect('/')
})

app.get('/profile',isLoggedIn , async(req,res) =>{
    let user = await userModel.findOne({email: req.user.email}).populate('posts')
    res.render('profile', {user})
})
app.post('/post',isLoggedIn , async(req,res) =>{
    let user = await userModel.findOne({email: req.user.email})
    let {content } = req.body

    let post = await postModel.create({
        user : user._id,
        content,
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
})

app.post('/create' , async (req,res) =>{
    let {username,name, email, password, age} = req.body
    let user = await userModel.findOne({email})
    if(user) return res.status(500).send('user already exits')

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt, async (err,hash)=>{
                let user = await userModel.create({
                    name,username,password: hash ,email,age
                })
                let token = jwt.sign({email: email, userid: user._id}, 'secretkey')
                res.cookie('token', token)
                res.send('ragistrad')

            })
        })
    
})
app.post('/login' , async (req,res) =>{
    let {email, password} = req.body
    let user = await userModel.findOne({email})
    if(!user) return res.status(500).send('somthing want wrong')

    bcrypt.compare(password, user.password, (err,result) =>{
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, 'secretkey')
            res.cookie('token', token)
            res.redirect('/profile')
        }
            else res.send('somthing want wrong')
    })
    
})

function isLoggedIn(req,res,next){
    let token = req.cookies.token
    if(token === '') res.redirect('/login')
        else if(!token){res.redirect('/login')} else {
         let data = jwt.verify(token , 'secretkey')
         req.user = data
        }
   next(); 
}

app.listen(7062)