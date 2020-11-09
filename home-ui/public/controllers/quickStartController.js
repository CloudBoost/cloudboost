
var codeMirrorEnabled = [];

//Initialization
$(document).ready(function () {
    languageClick('js', 1);
    switchFeature(1);
    featureSelected = 1;

    //LoadTutorials
    getTutorials();

    mixpanel.track('Visted QuickStart Page', { "visited": "visited QuickStart Page" });
    amplitude.getInstance().logEvent('Visted QuickStart Page', { "visited": "visited QuickStart Page" });

});
//Initialization

$(".js").click(function (event) {
    event.preventDefault();
    languageClick('js');
});

$(".java").click(function (event) {
    event.preventDefault();
    languageClick('java');
});

var languageClick = function (lang, id) {

    if (lang) {
        languageSelected = lang;
    }

    lang = languageSelected;
    $('.js').removeClass('active');
    $('.java').removeClass('active');
    $('.' + lang).addClass('active');
    $('.javaCode').hide();
    $('.jsCode').hide();
    $('.' + lang + 'Code').show();

    if (id) {
        featureSelected = id;
    }

    initCodeEditors(['initCode-' + lang], 'javascript', 50);

    if (featureSelected === 1) {
        initCodeEditors(['objectInsert-' + lang, 'objectQuery-' + lang], 'javascript');
    }

    if (featureSelected === 2) {
        initCodeEditors(['objectNotifications-' + lang, 'cloudNotifications-' + lang], 'javascript');
    }

    if (featureSelected === 3) {
        initCodeEditors(['searchSearch-' + lang, 'indexSearches-' + lang], 'javascript');
    }
};

$("#afeature1").click(function (event) {
    event.preventDefault();
    switchFeature(1);
});

$("#afeature2").click(function (event) {
    event.preventDefault();
    switchFeature(2);
});

$("#afeature3").click(function (event) {
    event.preventDefault();
    switchFeature(3);
});

var switchFeature = function (id) {
    //remove active classes.
    $('#feature1List').removeClass('active');
    $('#feature2List').removeClass('active');
    $('#feature3List').removeClass('active');

    $('#feature' + id + 'List').addClass('active');

    $('#feature1').hide();
    $('#feature2').hide();
    $('#feature3').hide();

    $('#feature' + id).show();

    languageClick(null, id);
};


var initCodeEditors = function (arr, language, size) {
    var codeEditors = arr;

    for (var i = 0; i < codeEditors.length; i++) {

        if (document.getElementById(codeEditors[i]) && codeMirrorEnabled.indexOf(codeEditors[i]) === -1) {

            var myCodeMirror = CodeMirror.fromTextArea(document.getElementById(codeEditors[i]),
                {
                    mode: language,
                    lineNumbers: true,
                    //theme : 'ambiance',
                    readOnly: true
                });

            if (size) {
                myCodeMirror.setSize(null, size);
            }

            codeMirrorEnabled.push(codeEditors[i]);
        }
    }
};

//getTutorials
function getTutorials() {
    var data = [
        {
            "_id": "55f7c1646b9dcc0810c3f527",
            "name": "Getting Started",
            "description": "A 2 minute quickstart on getting started with CloudBoost",
            "order": 1,
            "icon": "fa-cloud",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "yourfirstapp",
                        "category": "gettingstarted",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "2 min",
                    "difficulty": "Beginner",
                    "order": 1,
                    "description": "Build your very first app with CloudBoost in under 2 mins. Understand basic data-storage, querying and more. ",
                    "name": "Your First App",
                    "id": "datastr1"
                }
            ]
        },
        {
            "_id": "5654eb724777f614f4d21143",
            "name": "Objects and Files",
            "description": "Learn how to store different types of data in CloudBoost",
            "order": 2,
            "icon": "fa-database",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "objects",
                        "category": "datastorage",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",
                        "Nodejs"
                    ],
                    "time": "4 min",
                    "difficulty": "Beginner",
                    "order": 1,
                    "description": "In this tutorial, you'll learn to save, update and delete basic data into the CloudBoost",
                    "name": "Objects",
                    "id": "obj1"
                },
                {
                    "tutorialLink": {
                        "subcategory": "relations",
                        "category": "datastorage",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "6 min",
                    "difficulty": "Intermediate",
                    "order": 2,
                    "description": "In this tutorial, you'll learn save related objects and how relations work in CloudBoost.",
                    "name": "Relations",
                    "id": "obj3"
                },
                {
                    "tutorialLink": {
                        "subcategory": "geopoint",
                        "category": "datastorage",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "3 min",
                    "difficulty": "Intermediate",
                    "order": 3,
                    "description": "In this tutorial, you'll learn work with geo-location in your apps. ",
                    "name": "Geo Point",
                    "id": "obj4"
                },
                {
                    "tutorialLink": {
                        "subcategory": "files",
                        "category": "datastorage",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "4 min",
                    "difficulty": "Intermediate",
                    "order": 4,
                    "description": "In this tutorial, you'll learn to upload and save BLOBs and Files in CloudBoost ",
                    "name": "Files",
                    "id": "obj5"
                },
                {
                    "tutorialLink": {
                        "subcategory": "bulkapi",
                        "category": "datastorage",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "4 min",
                    "difficulty": "Intermediate",
                    "order": 5,
                    "description": "In this tutorial, you'll learn to save and delete multiple CloudObjects with CloudBoost.",
                    "name": "Bulk API",
                    "id": "obj6"
                }
            ]
        },
        {
            "_id": "55f7c1e36b9dcc0810c3f529",
            "name": "Query",
            "description": "Querying data with CloudBoost is a breeze. Don't believe us? Find it out yourself. ",
            "order": 3,
            "icon": "fa-code",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "basicqueries",
                        "category": "query",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "10 min",
                    "difficulty": "Beginner",
                    "order": 1,
                    "description": "Learn basic querying techniques in CloudBoost. All the way from EqualTo, to Joins",
                    "name": "Basic Queries",
                    "id": "query1"
                }
            ]
        },
        {
            "_id": "55f7c22c6b9dcc0810c3f52c",
            "name": "Real Time",
            "description": "Build great user experience to your apps by adding real-time features for your apps.",
            "order": 4,
            "icon": "fa-comment",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "customnotifications",
                        "category": "realtime",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "2 min",
                    "difficulty": "Beginner",
                    "order": 1,
                    "description": "Send any type of data to people who are subscribed to a your channel. ",
                    "name": "Custom Notifications",
                    "id": "realtime1"
                },
                {
                    "tutorialLink": {
                        "subcategory": "cloudobjectnotifications",
                        "category": "realtime",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "6 min",
                    "difficulty": "Intermediate",
                    "order": 2,
                    "description": "Receieve events when objects are updated, deleted, created in your app. ",
                    "name": "CloudObject Notifications",
                    "id": "realtime2"
                }
            ]
        },
        {
            "_id": "55f7c2446b9dcc0810c3f52d",
            "name": "Search",
            "description": "Want to build great search experiences? We have something for you. ",
            "order": 5,
            "icon": "fa-search",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "basicsearch",
                        "category": "search",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "6 min",
                    "difficulty": "Beginner",
                    "order": 1,
                    "description": "Learn how to do basic text searches, and add filters to your data.",
                    "name": "Basic Search",
                    "id": "search1"
                }
            ]
        },
        {
            "_id": "55f7c1fe6b9dcc0810c3f52a",
            "name": "Users and Roles",
            "description": "Is CloudBoost secure? Yes! Is your App secure. Well, That depends on you. Doesn't it?",
            "order": 6,
            "icon": "fa-users",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "acl",
                        "category": "security",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "6 min",
                    "difficulty": "Intermediate",
                    "order": 3,
                    "description": "Add security to every object you save with CloudBoost. Grant access to particular user or role. ",
                    "name": "ACL",
                    "id": "security1"
                },
                {
                    "tutorialLink": {
                        "subcategory": "roles",
                        "category": "security",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "4 min",
                    "difficulty": "Intermediate",
                    "order": 2,
                    "description": "Create new roles in your app, add users to roles and more. ",
                    "name": "Roles",
                    "id": "security2"
                },
                {
                    "tutorialLink": {
                        "subcategory": "users",
                        "category": "security",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "3 min",
                    "difficulty": "Beginner",
                    "order": 1,
                    "description": "Signing up and Logging in users is a piece of cake. Read more about authentication here. ",
                    "name": "Users",
                    "id": "security3"
                }
            ]
        },

        {
            "_id": "58af09f0c8a87ab358d2dab3",
            "name": "Offline Sync",
            "description": "Take your app offline with CloudBoost local store",
            "order": 6,
            "icon": "fa-refresh",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "localstore",
                        "category": "offlinesync",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript"
                    ],
                    "time": "10 min",
                    "difficulty": "Advanced",
                    "order": 1,
                    "description": "Add offline capabilities in your apps in minutes.",
                    "name": "Local Store",
                    "id": "1"
                }
            ]
        },
        {
            "_id": "55f7c2146b9dcc0810c3f52b",
            "name": "Tables",
            "description": "Creating a new tables and columns with CloudBoost is a breeze. Want to learn more?  ",
            "order": 7,
            "icon": "fa-table",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "cloudtables",
                        "category": "schema",
                        "lang": "en"
                    },
                    "languages": [
                        "Javascript",

                        "Nodejs"



                    ],
                    "time": "7 min",
                    "difficulty": "Intermediate",
                    "order": 1,
                    "description": "Create, update or delete any table or column with the new Schema API of CloudBoost. ",
                    "name": "Cloud Tables",
                    "id": "schema1"
                }
            ]
        },
        {
            "_id": "55f7c1646b9dcc0810c3f527",
            "name": "Integration",
            "description": "Integrate your CloudBoost App with 1000+ other apps and services.",
            "order": 9,
            "icon": "fa-cloud",
            "tutorials": [
                {
                    "tutorialLink": {
                        "subcategory": "zapier",
                        "category": "integrations",
                        "lang": "en"
                    },
                    "languages": [
                        "zapier"
                    ],
                    "time": "2 min",
                    "difficulty": "Beginner",
                    "order": 2,
                    "description": "In this tutorial, you will learn on how to integrate your application with other apps and services.",
                    "name": "Zapier",
                    "id": "inte2"
                }
            ]
        }
    ];

    for (var i = 0; i < data.length; ++i) {
        bindTutorialData(data[i]);
    }

    $(".tutorials-loading").remove();


}

function bindTutorialData(tutData) {

    var tutHtml = '<section id="" class="cb-tutorials">';
    tutHtml += '<div class="container bx-list">';
    tutHtml += '<!--Heading-->';
    tutHtml += '<div class="tut-heading flex-general-column-wrapper-center" style="margin-bottom:30px !important;"">';
    tutHtml += '<h1 style="color:#737373; font-family:Signika, sans-serif; font-weight: 700; ">' + tutData.name + '</h1>';
    tutHtml += '<span style="margin-top:10px; color:#737373; font-family: Signika, sans-serif; font-weight: 300; ">' + tutData.description + '</span>';
    tutHtml += '</div>';

    tutHtml += '<!--Boxes-->';
    tutHtml += '<div class="tut-bx-wrapper flex-general-row-wrapper">';
    //Create Tutorial Boxes

    tutData.tutorials.sort(function (a, b) {
        if (a.order > b.order) {
            return 1;
        }
        if (a.order < b.order) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });
    var result = createTutorialBox(tutData.tutorials);
    tutHtml += result;
    tutHtml += '</div>';
    tutHtml += '</div>';
    tutHtml += '</section>';

    $(".tutorials-parent").append(tutHtml);
}

function createTutorialBox(tutorialBoxList) {
    var tutBoxHtml = "";
    var tutorialURL = "https://tutorials.cloudboost.io";
    for (var i = 0; i < tutorialBoxList.length; ++i) {
        var boxHtml = '<!--******BOX*******-->';
        boxHtml += '<div style="position:relative; margin-top:20px; margin-bottom:5px;">';
        boxHtml += '<div class="tut-bx-container" data-boxid="' + tutorialBoxList[i].id + '">';
        boxHtml += '<div class="tut-name">';
        boxHtml += '<h3 class="flex-general-column-wrapper-center" style="margin-top:30px;color:#737373; font-family: Signika, sans-serif; font-weight: 300; ">' + tutorialBoxList[i].name + '</h3>';
        boxHtml += '</div>';
        boxHtml += '<div class="tut-desc">';
        boxHtml += '<div class="flex-general-column-wrapper-center">';
        boxHtml += '<span style="color:#737373; font-family: Signika, sans-serif; font-weight: 300; font-size:15px">' + tutorialBoxList[i].description + '</span>';
        boxHtml += '</div>';
        boxHtml += '</div>';
        boxHtml += '<div class="tut-labels flex-general-row-wrapper-center" style="margin-top:30px;">';
        boxHtml += '<div class="flex-general-row-wrapper" style="width:85%; color:#737373;">';
        boxHtml += '<div class="flex-equal-ratio-items flex-general-row-wrapper-center">';
        boxHtml += '<i class="fa fa-graduation-cap" style="color:#BEB7BF !important"></i>';
        boxHtml += '<span style="color:#BEB7BF !important">';
        boxHtml += '&nbsp;' + tutorialBoxList[i].difficulty;
        boxHtml += '</span>';
        boxHtml += '</div>';
        boxHtml += '<div class="flex-equal-ratio-items flex-general-row-wrapper-center">';
        boxHtml += '<i class="fa fa-clock-o" style="color:#BEB7BF !important"></i>';
        boxHtml += '<span style="color:#BEB7BF !important">';
        boxHtml += '&nbsp;' + tutorialBoxList[i].time;
        boxHtml += '</span>';
        boxHtml += '</div>';
        boxHtml += '</div>';
        boxHtml += '</div>';
        boxHtml += '<div style="border-top:1px solid #BCBABA;margin-top:25px;">';
        boxHtml += '</div>';

        boxHtml += '<div class="tut-prog-langs" style="margin-top:5px;">';
        boxHtml += '<div class="flex-general-column-wrapper-center" style="margin:0;">';
        boxHtml += '<span style="margin:0;color:#BCBABA;">Available</span>';
        boxHtml += '</div>';
        boxHtml += '<div class="prog-lang-list flex-general-column-wrapper-center">';
        boxHtml += '<div class="flex-general-row-wrapper">';

        //Loop over languages
        var langs = "";
        for (var j = 0; j < tutorialBoxList[i].languages.length; ++j) {
            //Javascript
            if (tutorialBoxList[i].languages[j] == "Javascript") {
                var langHtml = '<div class="flex-equal-ratio-items langIcon">';
                langHtml += '<i class="icon ion-social-javascript fa-lg"></i>';
                langHtml += '</div>';
                langs += langHtml;
            }
           
            //Node.js
            if (tutorialBoxList[i].languages[j] == "Nodejs") {
                var langHtml = '<div class="flex-equal-ratio-items langIcon">';
                langHtml += '<i class="icon ion-social-nodejs fa-lg"></i>';
                langHtml += '</div>';
                langs += langHtml;
            }

            //Zapier
            if (tutorialBoxList[i].languages[j] == "zapier") {
                var langHtml = '<div class="flex-equal-ratio-items langIcon">';
                langHtml += '<i class="fa fa-plug fa-lg"></i>';
                langHtml += '</div>';
                langs += langHtml;
            }
            
        }
        boxHtml += langs;//Bind languages

        boxHtml += '</div>';
        boxHtml += '</div>';
        boxHtml += '</div>';
        boxHtml += '</div>';

        var tURL = tutorialURL + "/" + tutorialBoxList[i].tutorialLink.lang + "/" + tutorialBoxList[i].tutorialLink.category + "/" + tutorialBoxList[i].tutorialLink.subcategory;
        boxHtml += '<!--On Hover-->';
        boxHtml += '<div id="' + tutorialBoxList[i].id + '" class="tut-bx-container-gray-bx flex-general-column-wrapper-center">';
        boxHtml += '<a href="' + tURL + '" target="_blank" data-subcat="' + tutorialBoxList[i].tutorialLink.subcategory + '" class="btn tut-view-btn"><p style="margin-top:3px;">View</p></a>';
        boxHtml += '</div>';
        boxHtml += '</div>';
        boxHtml += '<!--****/END BOX****-->';

        tutBoxHtml += boxHtml;
    }

    return tutBoxHtml;
}

//Tutorials functions
$(document).on("mouseenter", ".tut-bx-container", function (event) {
    $(".tut-bx-container-gray-bx").css("visibility", "hidden");
    var targetDiv = "#" + $(this).data("boxid");
    $(targetDiv).css("visibility", "visible");
    $(targetDiv).find(".tut-view-btn").css("display", "initial");
    $(targetDiv).removeClass('animated fadeOut');
    $(targetDiv).addClass('animated fadeIn');
});

$(document).on("mouseleave", ".tut-bx-container-gray-bx", function (event) {
    $(this).find(".tut-view-btn").css("display", "none");
    $(this).removeClass('animated fadeIn');
    $(this).addClass('animated fadeOut');
    $(this).css("visibility", "hidden");
});

$(document).on("click", ".tut-view-btn", function (event) {
    var subCategory = $(this).data("subcat");

    mixpanel.track('Quickstart-View Tutorial', { "subcategory": subCategory });
    amplitude.getInstance().logEvent('Quickstart-View Tutorial', { "subcategory": subCategory });

});

$(".quickstart-getstarted-btn").click(function () {

    mixpanel.track('Quickstart-Getting Started Tutorial', { "clicked": "Clicked on short button for first app" });
    amplitude.getInstance().logEvent('Quickstart-Getting Started Tutorial', { "clicked": "Clicked on short button for first app" });

});
