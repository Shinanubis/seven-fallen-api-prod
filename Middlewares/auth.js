function isAuthenticatedMiddleware (req, res, next){
    const authenticated = req.isAuthenticated();
    if(authenticated && authenticated === true){
        next();
    }else{
        res.status(401).send("Unauthorized")
    }
}

function isAuthenticatedResponse (req, res){
    try{
        const authenticated = req.isAuthenticated();
        if(authenticated === true){
            return res.status(200).json({
                id: req.session.passport.user,
                isAuthenticated: authenticated,
            })
        }

        throw {
            code: 401,
            isAuthenticated: false
        }
        
    }catch(error){
        return res.status(error.code).json({
            isAuthenticated: false
        })
    }
}

module.exports = {
    isAuthenticatedMiddleware,
    isAuthenticatedResponse
} 