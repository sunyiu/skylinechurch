//initialize Skyline-client
var skyline = Skyline(moment);

function isBlank(str) { return (!str || /^\s*$/.test(str)); }

function createCalendar(mDate) {
    var calendarTemplate = '<div class="calendar"><div class="day"></div><div class="month"></div><div class="date"></div></div>',
        calendar$ = $(calendarTemplate);

    calendar$.find('.date').html(mDate.format('DD'));
    calendar$.find('.day').html(mDate.format('ddd'));
    calendar$.find('.month').html(mDate.format('MMM'));

    return calendar$;
}

function createEvent(event){
    var eventTemplate = '<div class="event">' + 
            '<div class="calendarContainer"></div>' + 
            '<div class="detailContainer">' + 
                '<div class="name"></div><div class="description"><i class="material-icons">description</i></div><div class="time"><i class="material-icons">access_time</i></div><div class="location"><i class="material-icons">location_on</i></div>' + 
            '</div>' + 
        '</div>',
        startDateM = moment(event.startDate),
        endDateM = moment(event.endDate),
        startDate$ = createCalendar(startDateM),
        event$ = $(eventTemplate);

    event$.find('.calendarContainer').append(startDate$);    
    event$.find('.name').html(event.summary);

    if (startDateM.isBefore(moment(), 'date')){
        event$.addClass('mute');
    }

    if (event.isWholeDay){
        event$.find('.time').hide();
    }else{
        let timeHtml = startDateM.format('kk:mma') + ' - ' + endDateM.format('kk:mma');
        event$.find('.time').append('<span>' + timeHtml + '</span>');
    }

    if (isBlank(event.description)){
        event$.find('.description').hide();
    }else{
        event$.find('.description').html(event.description);
    }

    if (isBlank(event.location)){
        event$.find('.location').hide();        
    }else{
        event$.find('.location').append('<span>' + event.location + '</spn>');
    }

    return event$;
}


$(function(){    
    //event for the week
    var today = moment(),
        weekStart = moment().startOf('isoweek'),
        weekEnd = moment().endOf('isoweek'),
        to = moment(weekEnd).add(4, 'w');   //load additional 4 weeks for 'Find out more'


    $('#eventContainer').hide();

    skyline.getEvents(weekStart, to).then((events) =>{
        // console.log(events);
        let events$ = $('#eventContainer #events'),
            header$ = $('#eventContainer #header');

        _.forEach(events, function(e){
            let eventStartDate = moment(e.startDate),
                eventEndDate = moment(e.endDate),
                event$ = createEvent(e);
            
            events$.append(event$);

            if (!eventStartDate.isBetween(weekStart, weekEnd) && !eventEndDate.isBetween(weekStart, weekEnd)){
                event$.hide();
            }
        })

        $('#eventContainer').show(300);
        $('#loaderContainer').hide();
    });

    var eventContainerHeader$ = $('#eventContainer #header')
            .html('Events of the week (' + weekStart.format('DD MMM') + '-' + weekEnd.format('DD MMM') + ')');

    var findOutMore$ = $('#findOutMore')
        .data('level', 0)
        .click(function(e){
            let level = findOutMore$.data('level');                

            if (level == 0){
                //load 4 more weeks....
                eventContainerHeader$.html('Events between (' + weekStart.format('DD MMM YYYY') + ' - ' + to.format('DD MMM YYYY') + ')')
                findOutMore$.data('level', 1);
                findOutMore$.html('Find out even more');
            }
            
            $('.event:hidden').show(100);            
        });

})