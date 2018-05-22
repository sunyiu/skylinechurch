//initialize Skyline
var skyline_client = Skyline.client(moment),
    skyline_ui = Skyline.ui(moment);

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
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

function loadSermons(from, to) {
    return skyline_client.getSermons(from, to).then(function (sermons) {
        let result = [],
            sorted = sermons.sort(function(a, b){
                return moment(a.date).isBefore(moment(b.date));
            });

        _.forEach(sorted, function (s) {
            var sermon$ = skyline_ui.createSermon(s);
            sermon$.data('mDate', moment(s.date));
            $('section#sermons #sermonContainer #sermons').append(sermon$);
            result.push(sermon$);
        });
        return result;
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
    var sermonFrom = moment(weekEnd).subtract(10, 'w').endOf('d'); //4 more week for find out more and additional 4 weeks for clicking 'Find out even more'
    var sermonDisplay = moment(weekEnd).subtract(6, 'w').endOf('d');
    var getMorePastSermons$ = $('section#sermons div#getMorePastSermons button');    
    loadSermons(sermonFrom, weekEnd).then(function(sermon$s){
        if (sermon$s.length == 0) {
            $('section#contact div.sectionsCover').removeClass('color1').addClass('color3');
            $('section#sermons').hide();
            return;
        }

        let hasHiddenSermon = false;
        _.forEach(sermon$s, function (sermon$){
            let date = sermon$.data('mDate');
            if (date.isAfter(sermonDisplay)){
                sermon$.show();
            }else{
                hasHiddenSermon = true;
                sermon$.hide();
            }
        })

        if (hasHiddenSermon){
            getMorePastSermons$.show();
            getMorePastSermons$.click(function(e){
                $('section#sermons #sermonContainer #sermons').children(':hidden').show(150);

                //load 4 more weeks....
                let sermons$ = $('section#sermons #sermonContainer #sermons'),
                    //result = { events: [], monthDividers: [] },            
                    lastSermon = sermons$.children(':last-child'),
                    to = moment(lastSermon.data('mDate')).subtract(1, 'd').endOf('date')
                    from = moment(lastSermon.data('mDate')).subtract(4, 'w').endOf('date');

                loadSermons(from, to).then(function (sermon$s){
                    if (sermon$s.length == 0){
                        getMorePastSermons$.hide();
                    }
                });
            })
        }else{
            getMorePastSermons$.hide();
        }
        
        $('section#sermons #loaderContainer, header #loaderContainer').hide();                            
    })

    //contact
    $('#contactNameError, #contactEmailError, #contactMessageError, li#messageSent').hide();
    var feedbackSend$ = $('#feedbackSend')
        .click(function (e) {
            var from = $('#contactEmail').val(),
                name = $('#contactName').val(),
                message = $('#contactMessage').val(),
                hasError = false;

            $('#contactNameError, #contactEmailError, #contactMessageError').hide();

            if (isBlank(name)) {
                hasError = true;
                $('#contactNameError').html('Name cannot be empty').show();
            }
            if (!validateEmail(from)) {
                hasError = true;
                $('#contactEmailError').html('Email is not valid').show();
            }
            if (isBlank(message)) {
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

    //Get We images
    skyline_client.getWeImages().then(function (images) {
        if (!images || images.length == 0) {
            return;
        }

        let totalPicToDisplay = 5,
            pics = [], 
            isDone = false,
            count = 1;

        for (var i=0; i< totalPicToDisplay; i++){
            pics[i] = {
                index: i,
                isSelected: false
            }
        }

        while(count <= totalPicToDisplay){
            let index = _.random(0, totalPicToDisplay-1);
            if (!pics[index].isSelected){
                pics[index].isSelected = true;
                let we = skyline_ui.createWeHexa(images[index].fileId);
                $('section#we div.grid').append(we);
                count ++;
            }
        }


        // for (var i = 0; i < 5; i++) {
        //     //let index = _.random(0, images.length - 1),
        //     let index = i;
        //         we = skyline_ui.createWeHexa(images[index].fileId);
        //     $('section#we div.grid').append(we);
        // }
    });
})