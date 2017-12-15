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
        '<div class="day"></div>' +
        '<div class="month"></div>' +
        '<div class="date"></div>' +
        '</div>' +
        '<i class="material-icons">keyboard_arrow_right</i>' +
        '<div class="calendar to">' +
        '<div class="day"></div>' +
        '<div class="month"></div>' +
        '<div class="date"></div>' +
        '</div>' +
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

function loadEventsToService(from, to) {    
    return skyline.getEvents(from, to).then((events) => {
        // console.log(events);

        if (events.length == 0) {
            $('#findOutEvenMore').hide();
            return;
        }
        // console.log(events);

                               
        let events$ = $('section#services #eventContainer #events'),        
            //result = { events: [], monthDividers: [] },            
            lastEvent = events$.find('.event:last-child'),
            previousEventStartDate = lastEvent.length > 0 ? lastEvent.data('mStartDate') : null;        
         
        _.forEach(events, function (e) {
            let eventStartDate = moment(e.startDate),
                eventEndDate = moment(e.endDate),
                event$ = createEvent(e);
            
            event$.data('type', 'event');
            event$.data('mStartDate', eventStartDate);
            event$.data('mEndDate', eventEndDate);

            // if (previousEventStartDate){
            //     console.log(previousEventStartDate.format('MMMM YYYY') + ' ' + eventStartDate.format('MMMM YYYY') );
            // }

            if (previousEventStartDate == null || !previousEventStartDate.isSame(eventStartDate, 'month')) {
                let monthDivider = $('<div class="monthDivider" style="display:none">' + eventStartDate.format('MMMM YYYY') + '</div>');
                monthDivider.data('type', 'divider');
                monthDivider.data('mStartDate', eventStartDate);                
                events$.append(monthDivider);
            }
            
            events$.append(event$);
            previousEventStartDate = eventStartDate;
        })
    });
}


$(function () {
    //event for the week
    var today = moment(),
        weekStart = moment(today).startOf('isoweek'),
        weekEnd = moment(today).endOf('isoweek'),
        to = moment(weekEnd).add(8, 'w');   //4 more week for find out more and additional 4 weeks for clicking 'Find out even more'

        var headerEventContainerHeader$ = $('header #eventContainer #header')
            .html('Events for this week (' + weekStart.format('DD MMM') + '-' + weekEnd.format('DD MMM') + ')');

        
        loadEventsToService(weekStart, to).then(() => {            
            let eventsForTheWeek$ = $('header #eventContainer #eventsForTheWeek');

            let children = $('section#services #eventContainer #events > div').each(function(){
                let this$ = $(this),
                    type = this$.data('type'),
                    startDate = this$.data('mStartDate'),
                    endDate = type == 'event' ? this$.data('mEndDate') : null;

                //for the month
                if (startDate.isSame(weekStart, 'month') || startDate.isSame(weekEnd, 'month')) {
                    this$.show();
                }

                //for the header, this week events
                if (type == 'event' && (startDate.isBetween(weekStart, weekEnd) || endDate.isBetween(weekStart, weekEnd))) {
                    let eventForTheWeek = this$.clone();                        
                    eventForTheWeek.show();
                    eventsForTheWeek$.append(eventForTheWeek);
                }                

            });
                
                        
            $('section#services #eventContainer, header #eventContainer').show(150);
            $('header #loaderContainer').hide();



            

        //event for the week
        // let eventsForTheWeek$ = $('header #eventContainer #eventsForTheWeek');        
        // _.forEach(event$s, function (event$) {
        //     let eventStartDate = event$.data('mStartDate'),
        //         eventEndDate = event$.data('mEndDate');

        //     if (eventStartDate.isBetween(weekStart, weekEnd) || eventEndDate.isBetween(weekStart, weekEnd)) {                
        //         let eventForTheWeek = event$.clone();
        //         eventForTheWeek.show();
        //         eventsForTheWeek$.append(eventForTheWeek);
        //     }
        // });


        // $('header #eventContainer').show(150);
        // $('#loaderContainer').hide();






        // _.forEach(result.events, function (event$) {
        //     let eventStartDate = event$.data('mStartDate'),
        //         eventEndDate = event$.data('mEndDate');

        //     if (eventStartDate.isBetween(weekStart, weekEnd) || eventEndDate.isBetween(weekStart, weekEnd)) {
        //         let eventForTheWeek = event$.clone();
        //         eventForTheWeek.show();
        //     }
        // });

        // _.forEach(result.monthDividers, function(monthDivider$){
        //     if (monthDivider$.data('date').isBetween(weekStart, weekEnd)){
        //         monthDivider$.show();
        //     }
        // });
        
        // let events$ = $('#mainNav #eventContainer #eventsForTheWeek');


        // events$.data('from', weekStart);
        // events$.data('to', to);
                
        // $('#eventContainer').show(150);
        // $('#loaderContainer').hide();
    });

    var findOutMore$ = $('#findOutEvenMore')
        .data('level', 0)
        .click(function (e) {
            $('.event:hidden').show(150);
            $('.monthDivider:hidden').show(150);

            // let level = findOutMore$.data('level');                
            // if (level == 0){


            //eventContainerHeader$.html('Events between (' + events$.data('from').format('DD MMM YYYY') + ' - ' + events$.data('to').format('DD MMM YYYY') + ')')
            //findOutMore$.data('level', 1);
            findOutMore$.html('Find out even more');
            // }


            //load 4 more weeks....
            let events$ = $('section#services #eventContainer #events'),        
            //result = { events: [], monthDividers: [] },            
            lastEvent = events$.find('.event:last-child'),
            previousEventStartDate = lastEvent.data('mStartDate');

            let to = moment(previousEventStartDate).add(4, 'w'),
                from = moment(previousEventStartDate).add(1, 'd').startOf('date');

            //console.log(from.format('YYYY MMM DD') + ' ' + to.format('YYYY MMM DD'));
            //events$.data('from', from);
            //events$.data('to', to);

            loadEventsToService(from, to);            
        });

})