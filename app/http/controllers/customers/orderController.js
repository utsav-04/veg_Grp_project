const Order = require('../../../models/order')
const moment = require('moment')
const stripe=require('stripe')(process.env.STRIPE_PRIVATE_KEY)

function orderController () {
    return {
        store(req,res){
            const{phone, address,stripeToken,paymentType} = req.body
            if(!phone || !address) {
                return res.status(422).json({message:'All Fields are required'});
            }
            console.log(paymentType)
            const order = new Order ({
                customerId : req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address:address
            })
            order.save().then (result => {
                Order.populate(result,{path: 'customerId'},(err,resplaced) =>{
                    //req.flash('success', 'Order placed Successfully')

                    if(paymentType==='card')
                    {
                        console.log(paymentType)
                        stripe.charges.create({
                            amount:req.session.cart.totalPrice * 100,
                            source:stripeToken,
                            currency:'inr',
                            description:`Vegetable Order: ${resplaced._id}`
                        }).then(()=>{
                            resplaced.paymentStatus=true;
                            resplaced.save().then((ord)=>{
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced', ord)
                                delete req.session.cart
                                return res.json({message:'Payment successful ,Order placed successfully'});
                            }).catch((err)=>{
                                console.log(err)
                            })
                        }).catch((err)=>{
                            delete req.session.cart
                            return res.json({message:'Payment successful ,Order placed successfully'});
                        })
                     }
                    //return res.redirect('/customer/orders')
                } )
            }).catch(err => {
                return res.status(500).json({message:'Something Went wrong'});
            })
        }, 
        async index(req,res) {
            const orders = await Order.find({customerId: req.user._id},null, {sort: {'createdAt': -1}})
            res.render('customers/orders',{orders:orders, moment:moment})
        },

        async show(req,res) {
            const order = await Order.findById(req.params.id)
            if(req.user._id.toString() === order.customerId.toString()) {
                res.render('customers/singleOrder', {order})
            } else {
                res.redirect('/')
            }
        }
    }
}

module.exports = orderController