const Menu = require('../../models/menu')

function homeController(){
    return{
        async index(req,res){

            const burger = await Menu.find()
            res.render('home' , {burger:burger})   
        }
    }
}



module.exports = homeController