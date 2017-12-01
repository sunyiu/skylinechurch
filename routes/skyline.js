var express = require('express');
var router = express.Router();

var moment = require('moment');
var _ = require('lodash');
var skyline = require('../skyline/google');

router.get('/events', function (req, res, next) {
    let from = req.query.from
            ? moment(req.query.from, 'YYYY MM DD').startOf('day').format()
            : null,
        to = req.query.to
            ? moment(req.query.to, 'YYYY MM DD').endOf('day').format()
            : null;

        skyline.getCalendarEvents(from, to).then((events) => {
        let result = _.map(events, (item) => {
            return {
                type: 'event',
                summary: item.summary,
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
        res.send(JSON.stringify({ events: result }));
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Error ' + err);
    })
});

module.exports = router;