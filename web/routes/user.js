
/*
 * GET users listing.
 */

var dal = require(__dirname + '/../models/models.js');
var token = require('token');


function rpcError( res, code, message ) {
    res.json( { status: "ERR:" + code , message: message } );
    return;

}

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.rpc_login = function(req, res ) {
    var email    = req.body.email;
    var password = req.body.password;

    if( email === undefined || email === "" )
        return rpcError(res, "PARAM", "no email given");

    if( password === undefined || password === "" )
        return rpcError(res, "PARAM", "no password given");

    dal.userAuthorize( email, password, function(err, user) {
            if(err)
                return rpcError(res, "AUTH", "could not authenticate:" + err.message);
            
            var t = token.generate( user );
            var newuid = token.parse( t );

            res.cookie( 'token', t, { expires: new Date(Date.now() + 900000)} )

            res.json({ status: 'OK', 'user': user, 'token': t});
        } );
};

exports.rpc_create = function( req, res ) {
    var email    = req.body.email;
    var password = req.body.password;
    var name     = req.body.name;

    if( email === undefined || email === "" )
        return rpcError(res, "PARAM", "no email given");

    if( password === undefined || password === "" )
        return rpcError(res, "PARAM", "no password given");


    dal.userCreate( email, password, name, function( err, user ) {
            if(err)
                return rpcError( res, err.code, err.message );
            res.json( { status: 'OK', user: user } );
        });
};

