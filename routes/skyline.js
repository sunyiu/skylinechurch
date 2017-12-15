var express = require('express');
var router = express.Router();

var moment = require('moment');
var _ = require('lodash');
var skyline = require('../skyline/google');

router.get('/events', function (req, res, next) {
    let from = req.query.from
        ? moment(req.query.from, 'YYYY MM DD Z').startOf('day').format()
        : null,
        to = req.query.to
            ? moment(req.query.to, 'YYYY MM DD Z').endOf('day').format()
            : null;

    skyline.getCalendarEvents(from, to).then((result) => {
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

module.exports = router;