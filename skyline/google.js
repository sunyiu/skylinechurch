var google = require('googleapis'),
    _ = require("lodash"),
    jwtClient = null;


var googleCac = {

    authorize: function(googleKey){
        if (jwtClient != null) {
            console.log("Already connected!!!");
            return;
        }

        // configure a JWT auth client
        jwtClient = new google.auth.JWT(
            googleKey.privateKey.client_email,
            null,
            googleKey.privateKey.private_key,
            googleKey.scopes);

        //authenticate request
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log("Successfully connected to your Google account!");
            }
        });
    }

}





module.exports = googleCac;