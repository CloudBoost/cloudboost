import _ from 'underscore'
export const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

export const filterColors = [
    'rgb(160, 65, 226)',
    'rgb(46, 140, 236)',
    'rgb(171, 173, 28)',
    'rgb(193, 69, 39)',
    'rgb(194, 220, 42)',
    'rgb(250, 12, 211)',
    'rgb(178,144,10)',
    'rgb(98,246,30)',
    'rgb(198,84,15)',
    'rgb(159,245,91)',
    'rgb(57,88,206)',
    'rgb(176,199,153)'
];

export const chartFillColors = [
    'rgba(160, 65, 226,0.4)',
    'rgba(46, 140, 236,0.4)',
    'rgba(171, 173, 28,0.4)',
    'rgba(193, 69, 39,0.4)',
    'rgba(194, 220, 42,0.4)',
    'rgba(250, 12, 211,0.4)',
    'rgba(178,144,10,0.4)',
    'rgba(98,246,30,0.4)',
    'rgba(198,84,15,0.4)',
    'rgba(159,245,91,0.4)',
    'rgba(57,88,206,0.4)',
    'rgba(176,199,153,0.4)'
];

export const flattenJson = (data) => {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
            }
        else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop
                    ? prop + "." + p
                    : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

export const generateHash = () => {
    try {
        var id = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 8; i++) {
            id = id + possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return id;

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

export const validateQueryFields = (obj, opts) => {
    //opts=false if  object contains event's name with its property;
    //opts=true for filterQuery and false for funnel steps

    let validated = true;
    _.each(obj, (val, key, list) => {
        if (val.includeQuery || opts) {
            if (!val.value) {
                $('#queryValue' + key).css({border: '2px solid red'})
                validated = false;
            } else {
                $('#queryValue' + key).css({border: '1px solid #d9d9d9'})
            }
            if (!val.property) {
                $('.queryProperty' + key).css({border: '2px solid red'})
                validated = false;
            } else {
                $('.queryProperty' + key).css({border: '1px solid #d9d9d9'})
            }
        }
        if (!opts) {
            if (!val.event) {
                $('#funnelEventName' + key).css({border: '2px solid red'})
                validated = false;
            } else {
                $('#funnelEventName' + key).css({border: '1px solid #d9d9d9'})
            }
        }
    })
    return validated;
}

export const formatDate=(date)=>{
        date=new Date(date);
       return (month[date.getMonth()] + ' ' + date.getDate()+ ', '+ date.getFullYear());
    }