//initialize Skyline
var skyline_client = Skyline.client(moment),
    skyline_ui = Skyline.ui(moment);

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function loadEventsToService(from, to) {
    return skyline_client.getEvents(from, to).then((events) => {
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
                event$ = skyline_ui.createEvent(e);

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
        eventTo = moment(weekEnd).add(8, 'w').endOf('d') //4 more week for find out more and additional 4 weeks for clicking 'Find out even more'

    //load skyline events from event calendar
    var headerEventContainerHeader$ = $('header #eventContainer #header')
        .html('Events for this week (' + weekStart.format('DD MMM') + '-' + weekEnd.format('DD MMM') + ')');

    loadEventsToService(weekStart, eventTo).then(() => {
        let eventsForTheWeek$ = $('header #eventContainer #eventsForTheWeek');

        let children = $('section#services #eventContainer #events > div').each(function () {
            let this$ = $(this),
                type = this$.data('type'),
                startDate = this$.data('mStartDate'),
                endDate = type == 'event' ? this$.data('mEndDate') : null;

            //for the next 5 weeks
            let next5Weeks = moment(weekStart).add(4, 'weeks');
            if (startDate.isBetween(weekStart, next5Weeks)) {
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
        $('section#services #loaderContainer, header #loaderContainer').hide();
    });

    var findOutMore$ = $('#findOutEvenMore')
    .data('level', 0)
    .click(function (e) {
        $('.event:hidden').show(150);
        $('.monthDivider:hidden').show(150);

        findOutMore$.html('Find out even more');

        //load 4 more weeks....
        let events$ = $('section#services #eventContainer #events'),
            //result = { events: [], monthDividers: [] },            
            lastEvent = events$.find('.event:last-child'),
            previousEventStartDate = lastEvent.data('mStartDate');

        let to = moment(previousEventStartDate).add(4, 'w').endOf('date'),
            from = moment(previousEventStartDate).add(1, 'd').startOf('date');

        //console.log(from.format('YYYY MMM DD') + ' ' + to.format('YYYY MMM DD'));
        //events$.data('from', from);
        //events$.data('to', to);

        loadEventsToService(from, to);
    });    


    //load sermons from sermon calendar
    skyline_client.getSermons(moment(today).subtract(4, 'weeks'), today).then(function (sermons) {

        if (sermons.length == 0){
            $('section#contact div.sectionsCover').removeClass('color1').addClass('color3');            
            $('section#sermons').hide();
            return;
        }

        _.forEach(sermons, function (s) {
            var sermon$ = skyline_ui.createSermon(s);
            sermon$.show();
            $('section#sermons #sermonContainer #sermons').append(sermon$);
        })

        $('section#sermons #loaderContainer, header #loaderContainer').hide();
    });

   
    //contact
    $('#contactNameError, #contactEmailError, #contactMessageError, li#messageSent').hide();        
    var feedbackSend$ = $('#feedbackSend')
        .click(function (e) {
            var from = $('#contactEmail').val(),
                name = $('#contactName').val(),
                message = $('#contactMessage').val(),
                hasError = false;

            $('#contactNameError, #contactEmailError, #contactMessageError').hide();

            if (isBlank(name)){
                hasError = true;
                $('#contactNameError').html('Name cannot be empty').show();
            }
            if (!validateEmail(from)) {
                hasError = true;
                $('#contactEmailError').html('Email is not valid').show();
            }
            if (isBlank(message)){
                hasError = true;
                $('#contactMessageError').html('Message cannot be empty').show();                
            }

            if (!hasError) {
                $('li#messageSent').html('Sending.....').show();
                $('li#form').hide();
                skyline_client.sendFeedback(from, name, message).then(function (data) {
                    $('li#messageSent').html('We have received your message, thx ;>');
                });
            }
        });

})