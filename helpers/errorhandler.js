function errorhandler(err, req, res , next){
    console.log("In error",req.headers,err);
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({message:" Unauthorized Authentication "})
    }
    return res.status(500).json({message:err})
}
module.exports = errorhandler;