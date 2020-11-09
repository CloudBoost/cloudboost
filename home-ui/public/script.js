$("#footerShowSpinner").hide();
$("#subscribeBtn").click(function(event){
    event.preventDefault();
    var email=$("#subscribeInput").val();

    if(email){
        $("#footerShowSpinner").show();
        $("#footerSubscribeResult").hide();
        $("#footerSubscribeErr").hide();


        addSubscriber(email)
        .then(function( message ) {
            $("#subscribeInput").val(null);
            $("#footerShowSpinner").hide();
            $("#footerSubscribeResult").text(message);
            $("#footerSubscribeResult").show();
        },function( status ) {
            $("#footerShowSpinner").hide();
            $("#footerSubscribeErr").text(status);
            $("#footerSubscribeErr").show();
        });

        if(!__isDevelopment){
          /****Tracking************/
           mixpanel.track('Footer Subscribe Button', {"Clicked":"Footer Subscribe Button"});
           amplitude.getInstance().logEvent('Footer Subscribe Button', {"Clicked":"Footer Subscribe Button"});

          /****End of Tracking*****/
        }
    }
});

$(document).ready(function(){
    $("#footerShowSpinner").hide();
    var currentUrl=window.location.href;
    var currentLink = currentUrl.split("/")[3].toLowerCase();

    $('.cb-main-linkz').each(function(){
        //var linkText=$(this).text().toLowerCase();
        var innerTag=$(this)[0].innerHTML;
        var linkText=$(innerTag).text().toLowerCase()

        if(linkText==currentLink){
            $(this).removeClass("linkHover-nrml");
            $(this).addClass("link-nrmlActive");
        }
    });
});

    $("#home-footer-signup-btn").click(function(){
        if(!__isDevelopment){
          /****Tracking************/
           mixpanel.track('Footer Sign Up Button', {"Clicked":"Footer Sign Up Button"});
           amplitude.getInstance().logEvent('Footer Sign Up Button', {"Clicked":"Footer Sign Up Button"});
          /****End of Tracking*****/
        }
    });

    $(".dropdown").mouseenter(function(ev){
        ev.preventDefault();
        $(this).find(".dropdown-menu").fadeIn(300);
    });
    $(".dropdown").mouseleave(function(){
        $(this).find(".dropdown-menu").fadeOut(300);
    });

    $.get(window.location.origin + '/blogFeed',function(res){
      var xml = $.parseXML(res.body);
      $(xml).find('item').each(function(index) {
       if(index == 3)
        return false;
       var t = $(this);


       $(".blogFeed").append('<li><a id="blogLink" href="' + t.find('link').text() + '">' + t.find('title').text() + '</a></li>');
      });
    });
