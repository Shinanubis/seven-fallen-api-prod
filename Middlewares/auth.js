function isAuthenticatedMiddleware (req, res, next){
    const authenticated = req.isAuthenticated();
    if(authenticated && authenticated === true){
        next();
    }else{
        res.status(401).send("Unauthorized")
    }
}

function isAuthenticatedResponse (req, res){
    const authenticated = req.isAuthenticated();
    if(authenticated && authenticated === true){
        res.json({
            id: req.session.passport.user,
            isAuthenticated: authenticated,
        })
    }else{
        res.status(401).json({
            isAuthenticated: authenticated,
        })
    }
}

module.exports = {
    isAuthenticatedMiddleware,
    isAuthenticatedResponse
} 