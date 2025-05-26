module.exports.isLoggedIn = (request, response, next) => {
    if(!request.isAuthenticated()){
        request.session.returnTo = request.originalUrl;
        request.flash('error', 'You must be signed in!');
        return response.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}