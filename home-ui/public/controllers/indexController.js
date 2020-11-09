var codeMirrorEnabled = [];
var langTabSelected = 'js';
var featureSelected = 'storage';

var hideAllCode = function() {
    var $div_blocks = $('#div-storage-js, #div-storage-nodejs, #div-storage-java, #div-storage-dotnet, #div-storage-curl, #div-search-js, #div-search-nodejs, #div-search-java, #div-search-dotnet, #div-search-curl, #div-realtime-js, #div-realtime-nodejs, #div-realtime-java, #div-realtime-dotnet, #div-realtime-curl, #div-queues-js, #div-queues-nodejs, #div-queues-java, #div-queues-dotnet, #div-queues-curl, #div-cache-js, #div-cache-nodejs, #div-cache-java, #div-cache-dotnet, #div-cache-curl');
    $div_blocks.hide();
};

//Initialization
$(document).ready(function() {

    hideAllCode();
    $('#div-storage-js').show();
    $(".storagefeat").addClass('activatefeat');
    $(".jstab").addClass('activatelang');
    initCodeEditors(['storage-js']);

    /****Tracking************/
    mixpanel.track('Visted Home Page', {"visited": "visited Home Page"});
    amplitude.getInstance().logEvent('Visted Home Page', {"visited": "visited Home Page"});
    /****End of Tracking*****/

});
//Initialization

//Functions
$("#myCarousel").on('slid.bs.carousel', function() {
    //    console.log($('#myCarousel.carousel-inner.item.active.each-feature-wrap'));
    var featureName = ($('#myCarousel').find('.item').siblings('.active').find('.each-feature-wrap').data('featname'));

    featureClick(featureName);
    $(".introrap").remove();
    var introJson = feautureIntroText(featureName);

    var introHtml = '<div class="introrap">';
    introHtml += '<div class="intro1">';
    introHtml += '<span style="color:#159CEE;font-size:26px;font-weight:100;line-height:27px;">' + introJson.intro1 + '</span>';
    introHtml += '</div>';

    introHtml += '<div class="intro2" style="margin-top:12px;">';
    introHtml += '<span style="color:#383838;font-size:16px;">' + introJson.intro2 + '</span>';
    introHtml += '</div>';
    introHtml += '</div>';

    $(".todos-explain").html(introHtml);
});
$(".each-feature-wrap").click(function() {
    $(".each-feature-wrap").each(function() {
        $(this).removeClass('activatefeat');
    });

    $(this).addClass('activatefeat');
    var featureName = $(this).data('featname');
    featureClick(featureName);

    $(".introrap").remove();
    var introJson = feautureIntroText(featureName);

    var introHtml = '<div class="introrap">';
    introHtml += '<div class="intro1">';
    introHtml += '<span style="color:#159CEE;font-size:26px;font-weight:100;line-height:27px;">' + introJson.intro1 + '</span>';
    introHtml += '</div>';

    introHtml += '<div class="intro2" style="margin-top:12px;">';
    introHtml += '<span style="color:#383838;font-size:16px;">' + introJson.intro2 + '</span>';
    introHtml += '</div>';
    introHtml += '</div>';

    $(".todos-explain").html(introHtml);
});

$(".lang-fliprlabel").click(function(event) {
    event.preventDefault();

    $(".lang-fliprlabel").each(function() {
        $(this).removeClass('activatelang');
    });

    $(this).addClass('activatelang');

    var langName = $(this).data("langname");
    languageClick(langName);
});

var languageClick = function(lang) {
    hideAllCode();
    langTabSelected = lang;
    featureClick(featureSelected);
};

var featureClick = function(feature) {
    hideAllCode();
    var WidgetId = feature + '-' + langTabSelected;
    $('#div-' + WidgetId).show();
    initCodeEditors([WidgetId]);
    featureSelected = feature;
};

function initCodeEditors(arr) {
    var codeEditors = arr;

    for (var i = 0; i < codeEditors.length; i++) {

        if (document.getElementById(codeEditors[i]) && codeMirrorEnabled.indexOf(codeEditors[i]) === -1) {

            var myCodeMirror = CodeMirror.fromTextArea(document.getElementById(codeEditors[i]), {
                mode: "javascript",
                autoRefresh: true,
                readOnly: true,
                lineNumbers: true
            });

            codeMirrorEnabled.push(codeEditors[i]);
        }
    }
};

function hideAllCode() {
    var $div_blocks = $('#div-storage-js, #div-storage-nodejs, #div-storage-java, #div-storage-dotnet, #div-storage-curl, #div-search-js, #div-search-nodejs, #div-search-java, #div-search-dotnet, #div-search-curl, #div-realtime-js, #div-realtime-nodejs, #div-realtime-java, #div-realtime-dotnet, #div-realtime-curl, #div-queues-js, #div-queues-nodejs, #div-queues-java, #div-queues-dotnet, #div-queues-curl, #div-cache-js, #div-cache-nodejs, #div-cache-java, #div-cache-dotnet, #div-cache-curl');
    $div_blocks.hide();
};

function feautureIntroText(featureName) {
    var IntroJson = {
        intro1: null,
        intro2: null
    };

    if (featureName == "storage") {
        IntroJson.intro1 = "Rock solid performance and scale. Store data. Any data.";
        IntroJson.intro2 = "Our API ensures compatibility with a variety of development tools, platforms and app infrastructures. Eliminate the risk and cost involved with scale thanks to CloudBoost's horizontal scaling architecture. Our Enhanced features ensure data is always available and durable throughout any situation.";
    }
    if (featureName == "search") {
        IntroJson.intro1 = "Implement search engine in your apps with CloudSearch.";
        IntroJson.intro2 = "Implementing a search engine in your app can never be much easier. We index your data for search and let your users use our CloudSearch feature to get most accurate and relevant data as possible.";
    }
    if (featureName == "realtime") {
        IntroJson.intro1 = "Build realtime apps, effortlessly.";
        IntroJson.intro2 = "When data changes, apps built with CloudBoost update instantly across every device -- web or mobile. Get an instant notification when data is inserted, updated, or deleted.";
    }
    if (featureName == "queues") {
        IntroJson.intro1 = "Build Powerful apps with users and roles.";
        IntroJson.intro2 = "CloudBoost let's add authetication to your apps. Facebook, Twitter, Google, LinkedIn authentication done in minutes. Assign users to roles and have them access to right data with Access Control Lists (ACL's)";
    }
    if (featureName == "cache") {
        IntroJson.intro1 = "Store and stream files of any size.";
        IntroJson.intro2 = "CloudFiles lets you store and stream music, videos, documents and more of any size. Add support for files to your apps in minutes.";
    }
    return IntroJson;
}

function getAnnouncement(categories) {
    var res = null;
    for (var j = 0; j < categories.length; ++j) {
        if (categories[j] == "announcement") {
            res = categories[j];
            break;
        }
    }
    return res;
}

/****************************************Mixpanel Area********************************************************************/
$("#header-signupbtn").click(function() {

    mixpanel.track('Landing Header Sign Up Button', {"Clicked": "Sign up for free"});
    amplitude.getInstance().logEvent('Landing Header Sign Up Button', {"Clicked": "Sign up for free"});
});

$("#header-loginbtn").click(function() {

    mixpanel.track('Landing Header Login Button', {"Clicked": "Login"});
    amplitude.getInstance().logEvent('Landing Header Login Button', {"Clicked": "Login"});

});

$("#home-body-signup-btn").click(function() {

    mixpanel.track('HomePage Body Sign Up Button', {"Clicked": "HomePage Body Sign Up Button"});
    amplitude.getInstance().logEvent('HomePage Body Sign Up Button', {"Clicked": "HomePage Body Sign Up Button"});
});

$("#request-demo-btn").click(function() {

    mixpanel.track('HomePage Body Request Demo Button', {"Clicked": "HomePage Body Request Demo Button"});
    amplitude.getInstance().logEvent('HomePage Body Request Demo Button', {"Clicked": "HomePage Body Request Demo Button"});
});

$("#home-body-quickstart-btn").click(function() {

    mixpanel.track('HomePage CodeWidget QuickStart Button', {"Clicked": "HomePage CodeWidget QuickStart Button"});
    amplitude.getInstance().logEvent('HomePage CodeWidget QuickStart Button', {"Clicked": "HomePage CodeWidget QuickStart Button"});
});
$("#home-body-compare-btn").click(function() {
    if (!__isDevelopment) {
        /****Tracking************/
        mixpanel.track('HomePage CodeWidget Compare Button', {"Clicked": "HomePage CodeWidget Compare Button"});
        /****End of Tracking*****/
        amplitude.getInstance().logEvent('HomePage CodeWidget Compare Button', {"Clicked": "HomePage CodeWidget Compare Button"});
    }
});

$("#home-bottom-quickstart-btn").click(function() {

    mixpanel.track('HomePage Bottom QuickStart Button', {"Clicked": "HomePage Bottom QuickStart Button"});
    amplitude.getInstance().logEvent('HomePage Bottom QuickStart Button', {"Clicked": "HomePage Bottom QuickStart Button"});
});
$("#home-bottom-compare-btn").click(function() {

    mixpanel.track('HomePage Bottom Compare Button', {"Clicked": "HomePage Bottom Compare Button"});
    amplitude.getInstance().logEvent('HomePage Bottom Compare Button', {"Clicked": "HomePage Bottom Compare Button"});
});

$(".dockerlink").click(function() {

    mixpanel.track('HomePage Docker Link', {"Clicked": "HomePage Docker Link"});
    amplitude.getInstance().logEvent('HomePage Docker Link', {"Clicked": "HomePage Docker Link"});
});
$(".kuberneteslink").click(function() {

    mixpanel.track('HomePage Kubernetes Link', {"Clicked": "HomePage Kubernetes Link"});
    amplitude.getInstance().logEvent('HomePage Kubernetes Link', {"Clicked": "HomePage Kubernetes Link"});
});

$(".instagramclone").click(function() {

    mixpanel.track('HomePage Instagram Clone', {"Clicked": "HomePage Instagram Clone"});
    amplitude.getInstance().logEvent('HomePage Instagram Clone', {"Clicked": "HomePage Instagram Clone"});
});
$(".hnewsclone").click(function() {

    mixpanel.track('HomePage HackerNews Clone', {"Clicked": "HomePage HackerNews Clone"});
    amplitude.getInstance().logEvent('HomePage HackerNews Clone', {"Clicked": "HomePage HackerNews Clone"});
});
$(".slackclone").click(function() {

    mixpanel.track('HomePage Slack Clone', {"Clicked": "HomePage Slack Clone"});
    amplitude.getInstance().logEvent('HomePage Slack Clone', {"Clicked": "HomePage Slack Clone"});
});
$(".tinderclone").click(function() {

    mixpanel.track('HomePage Tinder Clone', {"Clicked": "HomePage Tinder Clone"});
    amplitude.getInstance().logEvent('HomePage Tinder Clone', {"Clicked": "HomePage Tinder Clone"});
});
$(".whatsappclone").click(function() {

    mixpanel.track('HomePage Whatsapp Clone', {"Clicked": "HomePage Whatsapp Clone"});
    amplitude.getInstance().logEvent('HomePage Whatsapp Clone', {"Clicked": "HomePage Whatsapp Clone"});
});
