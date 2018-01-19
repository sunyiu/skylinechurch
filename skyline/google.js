var google = require('googleapis'),
    key = require('../keys/google'),

    _ = require('lodash'),
    jwtClient = null;


var googleCac = {

    eventCalendarId: key.eventCalendarId,
    sermonCalendarId: key.sermonCalendarId,
    weFolderId: key.weFolderId,

    authorize: function () {
        if (jwtClient != null) {
            console.log("Already connected!!!");
            return;
        }

        // configure a JWT auth client
        jwtClient = new google.auth.JWT(
            key.privateKey.client_email,
            null,
            key.privateKey.private_key,
            key.scopes);

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

    getFilesInDriveFolder: function (folderId) {
        let drive = google.drive('v3');
        return new Promise((resolve, reject) => {
            drive.files.list({
                auth: jwtClient,
                q: "'" + folderId + "' in parents",
                maxResults: 100,
                fields: "nextPageToken, files(id, name, description)"
            }, function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    reject(err);
                    return;
                }
    
                var files = response.files;
                if (files.length == 0) {
                    console.log('No files found.');
                } else {
                    // console.log('Files:');
                    // for (var i = 0; i < files.length; i++) {
                    //     var file = files[i];
                    //     console.log('%s (%s, %s)', file.name, file.id, file.webViewLink, file.description);
                    // }
                }    
                resolve(response);
                return;
            });
        });
    },


    getCalendarEvents: function (calendarId, from, to) {
        //Google Calendar API
        //https://developers.google.com/google-apps/calendar/v3/reference/events/list
        //By default 250 events are returned per request - maxResults

        let calendar = google.calendar('v3');
        return new Promise((resolve, reject) => {
            let params = {
                auth: jwtClient,
                calendarId: calendarId,
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
                resolve(response);
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