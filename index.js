const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const paypal = require("paypal-rest-sdk");

// View engine
app.set('view engine','ejs');

//Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AYRqm6SbN3n6RZfaVEubaUwucqjBNwAZDyVf_qg90imJ7oqh1UCSnp03B03XxpogzPjBbVYCsz3AoHuF',
    'client_secret': 'EM-oo0MPBGrXMBhh-cMbnq-Igm3zcEGsbOLFmtMJGlqkqsBCGe5gn73cwfFKgP0Y-GSvLejVmXBU9BSG'
  });

app.get("/",(req, res) => {
    res.render("index");
});

app.post("/comprar", async (req,res)=>{
    const {email, id} = req.body;

    let pagamento = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/final?email="+email+"id="+id,
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "placa de video",
                    "sku": "placa_id",
                    "price": "675.00",
                    "currency": "BRL",
                    "quantity": 2
                }]
            },
            "amount": {
                "currency": "BRL",
                "total": "1350"
            },
            "description": "n sei finge que tem uma descricao foda aqui."
        }]
    };

    paypal.payment.create(pagamento,(error, payment)=>{
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            payment.links.forEach(pay=>{
                if(pay.rel === 'approval_url'){
                    res.redirect(pay.href);
                }
            })
        }
    })
})

app.get("/final",(req,res)=>{
    const {paymentId, PayerID} = req.query; 

    const final = {
        "payer_id": PayerID,
        "transactions":[{
            "amount": {
                "currency": "BRL",
                "total": "1350"
            }
        }]
    }
    paypal.payment.execute(paymentId,final,(error,payment)=>{
        if(error){
            console.log(error)
        }else{
            res.json(payment);
        }
    })
})

app.listen(3000, () => {
    console.log("Running!")
})

