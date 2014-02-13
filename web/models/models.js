var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/beacachoo');
var bcrypt = require('bcrypt');

console.log("Loading models");

var UserSchema = new mongoose.Schema({
        email: {type: String, required: true},
        name: { type: String, required: false },
        pwdhash: { type: String, required: true },
        salt: { type: String, required: true }
    });


var BeaconSchema = new mongoose.Schema({
        mac: { 'type': String, required: true },
        name: { 'type': String, required: true },
        info: { 'type': String },
        major: { 'type': String, required: true },
        minor: { 'type': String, required: true },
        date_created: { 'type': Date, default: Date.now },
        date_updated: { 'type': Date, default: Date.now },
        messages: [{
                message: String,
                date_created: Date,
            }
        ],
        });

var User   = mongoose.model('User', UserSchema);
var Beacon = mongoose.model('Beacon', BeaconSchema);

exports.userLookupByUid = function( uid, callback ) {
    User.find({'_id': uid}, function(err, users) {
            if(err || !users[0]) {
                callback({err: 'NOTFOUND', message: "User not found"});
                return;
            }
            callback( undefined, users[0] );
        });
}


exports.userAuthorize = function( email, password, callback ) {

    email = email.toLowerCase();

    User.find({'email': email}, function(err, users) {
            if(err || !users[0]) {
                console.log("error: " + err );
                callback({err: 'AUTH', message: "Unauthorized"});
                return;
            }

            var user = users[0];

            bcrypt.compare( password, user.pwdhash, function( err, same ) {
                    if(err)
                        return callback({err: 'AUTH', message: "hash problems1"});
                    if(!same)
                        return callback({err: 'AUTH', message: "hash problems2"});
                    callback( undefined, user );
                });

        });
};

exports.userCreate = function( email, password, name, callBack ) {

    email = email.toLowerCase();

    var user    = null;
    var salt    = null;
    var pwdHash = null;

    function saved(err) {
        if(err)
            return callBack({ code: 'DB', message: "Error while saving " + err });
        
        callBack( undefined, user );

    }

    function createUserNow() {

        user = new User({'email': email, 'pwdhash': pwdHash, 'name': name, 'salt': salt});
        user.save(saved);
    }

    function createdPwdHash(err, hash) {
        if( err )
            return callBack({ code: "CRYPTO", message: "Could not generate hash"});
        pwdHash = hash;
        createUserNow();
    }

    function createdSalt( err, salt2) {
        if(err)
            return callBack({code: "CRYPTO", message: "Could not generate salt"});
        salt = salt2;

        bcrypt.hash( password, salt, createdPwdHash );

    }

    function foundDup( err, users ) {
        if(err)
            return callBack({ code: 'DB', message: "Something went wrong in db"});
        if( users[0] )
            return callBack({ code: 'DUP', message: "Duplicate"});

        bcrypt.genSalt(10, 20, createdSalt );
    }

    User.find({'email': email}, foundDup);
};
