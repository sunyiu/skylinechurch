var express = require('express');
var router = express.Router();

var moment = require('moment');
var _ = require('lodash');
var skyline = require('../skyline/google');

var sgMail = require('@sendgrid/mail');
var sgKey = require('../keys/sendGrid');
sgMail.setApiKey(sgKey.apiKey);


router.get('/sermons', function (req, res, next) {
    let from = req.query.from
        ? moment(req.query.from, 'YYYY MM DD HH:mm Z').format()
        : null,
        to = req.query.to
            ? moment(req.query.to, 'YYYY MM DD HH:mm Z').format()
            : null;

    skyline.getCalendarEvents(skyline.sermonCalendarId, from, to).then((result) => {
        if (result.nextPageToken) {
            //TODO:: get events resurivly
        }

        let events = _.map(result.items, (item) => {
            
            let descriptions = _.chain(item.description)
                .split('\n')
                .filter((s) =>{
                    return s;
                })
                .value(),
                backgroundImageId = (item.attachments && item.attachments.length > 0) ? item.attachments[0].fileId : null;
            
            // console.log(_.split(item.description, '\n').length);
            // console.log('test -- ' + item.description + ' ::: ' + descriptions[0] + ' ::: ' + descriptions[1] + ' ::: ' + backgroundImageId);

            return {
                type: 'sermon',
                date: item.start.date != null ? item.start.date : item.start.dateTime,
                summary: item.summary,
                youtubeLink: (descriptions && descriptions.length >= 0) ? descriptions[0] : item.description,
                scripture: (descriptions && descriptions.length > 0) ? descriptions[1] : null,
                backgroundImageId: backgroundImageId
            }
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ events: events }));
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Error ' + err);
    })
});

router.get('/events', function (req, res, next) {
    let from = req.query.from
        ? moment(req.query.from, 'YYYY MM DD HH:mm Z').format()
        : null,
        to = req.query.to
            ? moment(req.query.to, 'YYYY MM DD HH:mm Z').format()
            : null;

    skyline.getCalendarEvents(skyline.eventCalendarId, from, to).then((result) => {
        if (result.nextPageToken) {
            //TODO:: get events resurivly
        }

        let events = _.map(result.items, (item) => {
            return {
                type: 'event',
                summary: item.summary,
                description: item.description,
                location: item.location,
                attachments: item.attachments,
                isWholeDay: item.start.date != null,
                startDate: item.start.date != null
                    ? item.start.date
                    : item.start.dateTime,
                endDate: item.end.date != null
                    ? item.end.date
                    : item.end.dateTime
            }
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ events: events }));
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Error ' + err);
    })
});

router.get('/we', function(req, res, next){
    skyline.getFilesInDriveFolder(skyline.weFolderId).then((result) =>{
        let images = [];
        _.forEach(result.files, (f)=>{
            images.push({
                name: f.name,
                description: f.description,
                fileId: f.id
            })
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ images: images }));
    }).catch((err)=>{
        console.log(err);
        res.status(500).send('Error ' + err);
    })
});

router.post('/feedback', function (req, res, next) {
    //console.log('post' + req);
    let from = req.body.from,
        name = req.body.name,
        message = req.body.message;

    var msg = {
        to: 'contact@skylinechurch.ca',
        from: from,
        subject: 'Message from web page (' + name + ')',
        text: message,
    };

    sgMail.send(msg).then((result) => {
        res.send('Feedback send');
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Error ' + err);
    });
});

module.exports = router;