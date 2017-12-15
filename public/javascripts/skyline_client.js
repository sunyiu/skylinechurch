//momentjs is required

var Skyline = (function(moment){
    
    init();

    function init(){
        if (!moment){
            console.log('ERROR!! skyline::MomentJS is missing!!!')
        }

    };

    function getEvents(from, to){
        if (!moment.isMoment(from) || !moment.isMoment(to)){
            console.log('Input is not in MomentJS format');
        }

        var deferred = new $.Deferred(),
            params = {
                from: from.format('YYYY MM DD Z'),
                to: to.format('YYYY MM DD Z')
            },
            url = './skyline/events?' + $.param(params);

        $.get(url, null, (data) => {                        
            deferred.resolve(data.events);
        }, 'json');

        return deferred.promise();
    };

    return {
        getEvents: getEvents
    }


});