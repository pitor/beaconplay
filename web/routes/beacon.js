var fs = require('fs');
var path = require('path');

var beacons = [];

var mongoose = require('mongoose');
var Beacon   = mongoose.model('Beacon');

var dal = require(__dirname + '/../models/models.js');

exports.list = function( req, res ) {
    Beacon.find({}, function(err,  beacons) {
            res.render('beacons', {
                    title: 'List of Beacons',
                    beacons: beacons
                });
        });
};


exports.rpc_list = function( req, res ) {
    Beacon.find({}, function(err,  beacons) {
            if(err) {
                res.json( { status: "ERR", error: err} );
                return;
            }
            res.json( { status: "OK", 
                        retval: { 
                        beacons: beacons 
                    } 
                });
        });
}

exports.rpc_register = function( req, res ) {

    var mac   = req.body.mac;
    var name  = req.body.name;
    var info  = req.body.info || "";
    var major = req.body.major;
    var minor = req.body.minor;

    Beacon.find({mac: mac}, function(err, beacons) {
            if(err) {
                res.json({ status: "ERR:SAVE", error: err});
                return;
            }
            
            var beacon;
            if(beacons[0]) { 
                beacon = beacons[0];
                beacon.increment();
            }
            else {
                beacon = new Beacon({ major: major, minor: minor});
            }

            beacon.set( 'name', name );
            beacon.set( 'mac', mac );

            beacon.save( function( err ) {
                    if(err) {
                        res.json({ status: "ERR:SAVE", error: err});
                    }
                    else
                        res.json({ status: "OK"});
                });
        });

};

exports.rpc_delete = function( req, res ) {
    var mac = req.body.mac;
    console.log("rpc_delete: mac=" + mac );
    Beacon.remove({mac: mac}, function(err) {
            if(err)
                res.json({status: 'ERR', error: err});
            else
                res.json({status: 'OK'});
        });
}
