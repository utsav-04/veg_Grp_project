
require('dotenv').config()
const express = require('express')
const app =express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
//const MongoDbStore = require('connect-mongo')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')

const url = 'mongodb://localhost:27017/Burger_Moon';
mongoose.connect(url,
{   useNewUrlParser: true,  
    useUnifiedTopology:true
    }).then(() =>
        console.log('Database connected..')
    ).catch((err) =>
        console.log('Connection failed ...'));

/*connection.once("open",() =>
    console.log('Database connected..')
).on( "error", error => {
    console.log('Connection failed ...');
});*/
//const connection = mongoose.connection;


/*let mongoStore = new MongoDbStore({
    mongooseConnection: mongoose.Connection,
    collection: 'sessions'
})*/

const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions'
    }),
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
}))

const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

app.use((req,res,next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)



const server = app.listen(PORT , () => {
    console.log(`Listening on PORT xyz ${PORT}`)
})



const io = require ('socket.io') (server) 
io.on('connection',(socket)=> {
     

     socket.on('join',(orderId)=> {
        
        socket.join(orderId)
        
     })
})

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})