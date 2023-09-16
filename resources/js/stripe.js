import {placeOrder} from './api'
import {loadStripe} from '@stripe/stripe-js'

export async function initStripe(){
    const stripe = await loadStripe('pk_test_51NoWCrSIsbRSeEGV1sdYQqyyIkpu1BJ9go1tyzEThmJFMB7aVTqUAIwyQUqIJyAuseM474IzC8JvOZIq4S4bjoqZ000Iah4sxP');
    let card=null;
    function mountWidget() {
        const elements = stripe.elements()
        let style = {
            base:{    
            color: '#32325d',        
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',        
            fontSmoothing: 'antialiased',        
            fontSize: '16px',        
            '::placeholder': {        
            color: '#aab7c4'
            }
        },        
            invalid: {       
            color: '#fa755a',        
            iconColor:'#fa755a'
            }
        };
    
    
        card=elements.create('card',{style,hidePostalCode:true})
        card.mount('#card-element')
    }
    const paymentForm=document.querySelector('#payment-form')
    const paymentType=document.querySelector('#paymentType');
    if (!paymentType)
    {
        return;
    }
    paymentType.addEventListener('change',(e)=>{
        console.log(e)
        if(e.target.value=== 'card')
        {
            mountWidget();
        }
        else{
            card.destroy()
        }
    })



    if (paymentForm){
        paymentForm.addEventListener('submit',(e)=>{
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObject = {}
            for(let [key,value] of formData.entries())
            {
                formObject[key]=value
            }
            if(!card)
            {
                placeOrder(formObject);
                return;
            }
            stripe.createToken(card).then((result)=>{
                console.log(result)
                formObject.stripeToken=result.token.id;
                placeOrder(formObject);
            }).catch((err)=>{
                console.log(err)
            })
        })
    }
}