//initialize Skyline-client
var skyline = Skyline(moment);

function isBlank(str) { return (!str || /^\s*$/.test(str)); }

function createCalendar(mDate) {
    var calendarTemplate = '<div class="calendar"><div class="day"></div><div class="month"></div><div class="date"></div></div>',
        calendar$ = $(calendarTemplate);

    calendar$.find('.date').html(mDate.format('DD'));
    calendar$.find('.day').html(mDate.format('ddd'));
    calendar$.find('.month').html(mDate.format('MMM'));

    if (mDate.isBefore(moment(), 'date')) {
        calendar$.addClass('mute');
    }
    if (mDate.day() == 0) {
        calendar$.addClass('sunday');
    }

    return calendar$;
}

function createRangeCalendar(mFrom, mTo) {
    var calendarTemplate = '<div class="rangeCalendar">' + 
            '<div class="calendar from">' +
                '<div class="day"></div>'+
                '<div class="month"></div>'+
                '<div class="date"></div>'+
            '</div>'+
            '<i class="material-icons">keyboard_arrow_right</i>' +
            '<div class="calendar to">' +
                '<div class="day"></div>'+
                '<div class="month"></div>'+
                '<div class="date"></div>'+
            '</div>'+            
        '</div>',
        calendar$ = $(calendarTemplate);

    calendar$.find('.from .date').html(mFrom.format('DD'));
    calendar$.find('.from .day').html(mFrom.format('ddd'));
    calendar$.find('.from .month').html(mFrom.format('MMM'));
    calendar$.find('.to .date').html(mTo.format('DD'));
    calendar$.find('.to .day').html(mTo.format('ddd'));
    calendar$.find('.to .month').html(mTo.format('MMM'));    

    var from$ = calendar$.find('.from');
    if (mFrom.isBefore(moment(), 'date')) {
        from$.addClass('mute');
    }
    if (mFrom.day() == 0) {
        from$.addClass('sunday');
    }

    var to$ = calendar$.find('.to');
    if (mTo.isBefore(moment(), 'date')) {
        to$.addClass('mute');
    }
    if (mTo.day() == 0) {
        to$.addClass('sunday');
    }

    return calendar$;
}

function createEvent(event) {
    //event Template is hidden by default
    var eventTemplate = '<div class="event" style="display: none">' +
        '<div class="calendarContainer"></div>' +
        '<div class="detailContainer">' +
        '<div class="name"><strong></strong></div>' +
        '<div class="time"><i class="material-icons">access_time</i></div>' +
        '<div class="location"><i class="material-icons">location_on</i></div>' +
        '<div class="description"><i class="material-icons">description</i></div>' +
        '</div>' +
        '</div>',
        startDateM = moment(event.startDate),
        endDateM = moment(event.endDate),
        event$ = $(eventTemplate);

    if (startDateM.isBefore(moment(), 'date') && endDateM.isBefore(moment(), 'date')) {
        event$.addClass('mute');
    }

    if (startDateM.isSame(endDateM, 'day')) {
        event$.find('.calendarContainer').append(createCalendar(startDateM));
    } else {
        event$.find('.calendarContainer').append(createRangeCalendar(startDateM, endDateM));
    }

    event$.find('.name strong').html(event.summary);

    if (event.isWholeDay) {
        event$.find('.time').hide();
    } else {
        let timeHtml = startDateM.format('kk:mma') + ' - ' + endDateM.format('kk:mma');
        event$.find('.time').append('<span>' + timeHtml + '</span>');
    }

    if (isBlank(event.location)) {
        event$.find('.location').hide();
    } else {
        event$.find('.location').append('<span>' + event.location + '</spn>');
    }

    if (isBlank(event.description)) {
        event$.find('.description').hide();
    } else {
        event$.find('.description').append('<span><pre>' + event.description + '</pre></span>');
    }

    return event$;
}


$(function () {
    //event for the week
    var today = moment(),
        weekStart = moment().startOf('isoweek'),
        weekEnd = moment().endOf('isoweek'),
        to = moment(weekEnd).add(4, 'w');   //load additional 4 weeks for 'Find out more'

    skyline.getEvents(weekStart, to).then((events) => {
        // console.log(events);
        let events$ = $('#eventContainer #events');

        events$.data('from', weekStart);
        events$.data('to', to);

        _.forEach(events, function (e) {
            let eventStartDate = moment(e.startDate),
                eventEndDate = moment(e.endDate),
                event$ = createEvent(e);

            events$.append(event$);

            if (eventStartDate.isBetween(weekStart, weekEnd) || eventEndDate.isBetween(weekStart, weekEnd)) {
                event$.show();
            }
        })

        $('#eventContainer').show(150);
        $('#loaderContainer').hide();
    });

    var eventContainerHeader$ = $('#eventContainer #header')
        .html('Events for this week (' + weekStart.format('DD MMM') + '-' + weekEnd.format('DD MMM') + ')');

    var findOutMore$ = $('#findOutMore')
        .data('level', 0)
        .click(function (e) {
            $('.event:hidden').show(150);

            // let level = findOutMore$.data('level');                
            // if (level == 0){

            let events$ = $('#eventContainer #events');

            eventContainerHeader$.html('Events between (' + events$.data('from').format('DD MMM YYYY') + ' - ' + events$.data('to').format('DD MMM YYYY') + ')')
            findOutMore$.data('level', 1);
            findOutMore$.html('Find out even more');
            // }


            //load 4 more weeks....
            let to = moment(events$.data('to')).add(4, 'w'),
                from = moment(events$.data('to')).add(1, 'd').startOf('date');

            //console.log(from.format('YYYY MMM DD') + ' ' + to.format('YYYY MMM DD'));
            //events$.data('from', from);
            events$.data('to', to);

            skyline.getEvents(from, to).then((events) => {

                if (events.length == 0){
                    findOutMore$.hide();
                    return;
                }
                // console.log(events);

                _.forEach(events, function (e) {
                    let eventStartDate = moment(e.startDate),
                        eventEndDate = moment(e.endDate),
                        event$ = createEvent(e);

                    events$.append(event$);
                })
            });

        });

})