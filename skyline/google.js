var google = require('googleapis'),
    key = require('../keys/key'),
    _ = require('lodash'),
    jwtClient = null;


var googleCac = {

    authorize: function(){
        if (jwtClient != null) {
            console.log("Already connected!!!");
            return;
        }

        // configure a JWT auth client
        jwtClient = new google.auth.JWT(
            key.google.privateKey.client_email,
            null,
            key.google.privateKey.private_key,
            key.google.scopes);

        //authenticate request
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log("Successfully connected to your Google account!");
            }
        });
    },

    getCalendarEvents: function (from, to) {
        //Google Calendar API
        let calendar = google.calendar('v3');
        return new Promise((resolve, reject) => {
            let params = {
                auth: jwtClient,
                calendarId: key.google.eventCalendarId,
                singleEvents: true,     //flatten the recursive events
                orderBy: 'startTime'
            };
            if (from) {
                params.timeMin = from;
            }
            if (to) {
                params.timeMax = to;
            }
            calendar.events.list(params, function (err, response) {
                if (err) {
                    //console.log('The API returned an error: ' + err);
                    reject(err);
                    return;
                }
                resolve(response.items);
                //var events = response.items;      
                // if (events.length == 0) {
                //   console.log('No events found.');
                // } else {
                //   console.log('Event from Google Calendar:');
                //   for (let event of response.items) {
                //     console.log('Event name: %s, Creator name: %s, Create date: %s', event.summary, event.creator.displayName, event.start.date);
                //   }
                // }
            });
        });
    }    

}





module.exports = googleCac;