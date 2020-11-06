module.exports = function (){
    return  {
        //Defaults. 
        analyticsUrl: 'https://cloudboost.io/cluster-analytics/',
        globalDb : "_GLOBAL",
        globalSettings : "_Settings",
        slackWebHook : process.env['SLACK_WEBHOOK']
    };
};
