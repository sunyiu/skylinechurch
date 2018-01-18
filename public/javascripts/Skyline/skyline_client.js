//momentjs is required

var Skyline = Skyline || {};

Skyline.client = (function (moment) {

    init();

    function init() {
        if (!moment) {
            console.log('ERROR!! skyline::MomentJS is missing!!!')
        }

    };

    function getCalendarEvents(type, from, to) {
        var deferred = new $.Deferred(),
            params = {
                from: from.format('YYYY MM DD HH:mm Z'),
                to: to.format('YYYY MM DD HH:mm Z')
            },
            url = type == 'sermon'
                ? './skyline/sermons?' + $.param(params)
                : './skyline/events?' + $.param(params);

        $.get(url, null, (data) => {
            deferred.resolve(data.events);
        }, 'json');

        return deferred.promise();
    }


    function getSermons(from, to) {
        if (!moment.isMoment(from) || !moment.isMoment(to)) {
            console.log('Input is not in MomentJS format');
        }
        return getCalendarEvents('sermon', from, to)
    }

    function getEvents(from, to) {
        if (!moment.isMoment(from) || !moment.isMoment(to)) {
            console.log('Input is not in MomentJS format');
        }
        return getCalendarEvents('events', from, to)
    };

    function sendFeedback(from, name, message) {
        var deferred = new $.Deferred(),
            url = './skyline/feedback?';
        $.post(url, {
            from: from,
            name: name,
            message: message
        }).done(function(data){
            console.log(data);
            deferred.resolve(data);
        })

        return deferred.promise();
    }

    return {
        getEvents: getEvents,
        getSermons: getSermons,
        sendFeedback: sendFeedback
    }


});