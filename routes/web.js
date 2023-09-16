
const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth')
const AdminOrderController = require('../app/http/controllers/admin/orderController')
const admin = require('../app/http/middlewares/admin')
const statusController = require('../app/http/controllers/admin/statusController')



function initRoutes(app){
    app.get('/',(req,res) =>{
        res.render('customers/index')
    })

    app.get('/product', homeController().index)

    app.get('/about',(req,res) =>{
        res.render('customers/about')
    })

    app.get('/contact',(req,res) =>{
        res.render('customers/contact')
    })

    app.get('/cart', cartController().index)

    app.post('/update-cart', cartController().update)
    
    app.get('/login',guest, authController().login)
    app.post('/login', authController().postLogin)

    app.post('/logout', authController().logout)
    
    app.get('/register',guest, authController().register)
    app.post('/register', authController().postRegister)

    app.post('/orders',orderController().store )

    app.post('/orders',auth, orderController().store)
    app.get('/customer/orders',auth, orderController().index)
    app.get('/customer/orders/:id',auth, orderController().show)

    app.get('/admin/orders', admin, AdminOrderController().index)

    app.post('/admin/order/status', admin, statusController().update)
}


module.exports = initRoutes