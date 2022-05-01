const expressjwt = require('express-jwt');

function authjwt(){
    const secret = process.env.secret;
    // const api = process.env.url;
    return expressjwt({
        secret,
        algorithms : ['HS256'],
        isRevoked : isRevoked,
    }).unless({
        path : [
            {url:"/api/user/newUser",method:["POST",'OPTIONS']},
            {url:"/api/user/gUser",method:["POST",'OPTIONS']},
            {url:"/api/user/login", method:["POST",'OPTIONS']},
            {url:"/api/user/otp", method:["POST",'OPTIONS']},
            {url:"/api/user/getOtp", method:["POST",'OPTIONS']},
            {url:"/api/user/otpChecks", method:["POST",'OPTIONS']},
            {url:"/api/user/mobileOtp", method:["POST",'OPTIONS']},
            {url:"/api/user/checkMobileOtp", method:["POST",'OPTIONS']},
            {url:"/api/email/newEmail", method:["POST",'OPTIONS']},
            {url:"/api/user/addwishlist/:id",method:["PUT",'OPTIONS']},
            {url:"/api/user/removewishlist/:id",method:["PUT",'OPTIONS']},
            {url: /\/api\/user\/updateUser(.*)/ , method: ['PUT','OPTIONS']},
            {url: /\/api\/Order\/newOrder(.*)/ , method: ['POST','OPTIONS']},
            {url: /\/api\/Order\/cancel-order(.*)/ , method: ['POST','OPTIONS']},
            {url: /\/api\/Order\/onlinePayment(.*)/ , method: ['POST','OPTIONS']},
            {url: /\/api\/Order\/reschedule-Date(.*)/,method:["PUT",'OPTIONS']},
            {url: /\/api\/Order\/is-order-complete(.*)/ , method: ['POST','OPTIONS']},
            {url: /\/api\/user\/addwishlist(.*)/ , method: ['PUT','OPTIONS']},
            {url: /\/api\/user\/removewishlist(.*)/ , method: ['PUT','OPTIONS']},
            {url: /\/api\/user\/addCart(.*)/ , method: ['PUT','OPTIONS']},
            {url: /\/api\/service\/newFeedBack(.*)/,method:['PUT','OPTIONS']},
            {url: /\/api\/user\/removeCart(.*)/ , method: ['PUT','OPTIONS']},
            {url:"/api/user/updatePassword",method:["PUT",'OPTIONS']},
            {url: /(.*)/ , method: ['GET','OPTIONS']},
        ]
    })
}

async function isRevoked(req, payload, done){
    console.log(payload);
    if(!payload.isAdmin) {
        done(null,true)
    }
    done()
}

module.exports = authjwt;