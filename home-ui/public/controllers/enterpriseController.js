if(!__isDevelopment) {
  mixpanel.track('Visted Enterprise Page', {
    "visited": "visited Enterprise Page"
  });
  amplitude.getInstance().logEvent('Visted Enterprise Page', {
    "visited": "visited Enterprise Page"
  });
  $('#demo-btn').click(function(e) {
    e.preventDefault();
    mixpanel.track('Clicked Request Demo Button', {
      "clicked": "Request Demo Button"
    });
    amplitude.getInstance().logEvent('Clicked Request Demo Button', {
      "clicked": "Request Demo Button"
    });
  });
  $('#sign-up-btn').click(function(e) {
    e.preventDefault();
    mixpanel.track('Clicked SignUp Button', {
      "clicked": "SignUp Button"
    });
    amplitude.getInstance().logEvent('Clicked SignUp Button', {
      "clicked": "SignUp Button"
    });
  });
  $('#contact-us-btn').click(function(e) {
    e.preventDefault();
    mixpanel.track('Clicked Contact Us Button', {
      "clicked": "Contact Us Button"
    });
    amplitude.getInstance().logEvent('Clicked Contact Us Button', {
      "clicked": "Contact Us Button"
    });
  });
}

$(document).on("mouseenter",".tut-bx-container",function(event){
  $(".tut-bx-container-gray-bx").css("visibility", "hidden");
  var targetDiv="#"+$(this).data("boxid");
  $(targetDiv).css("visibility", "visible");
  $(targetDiv).find(".tut-view-btn").css("display", "initial");
  $(targetDiv).removeClass('animated fadeOut');
  $(targetDiv).addClass('animated fadeIn');
});

$(document).on("mouseleave",".tut-bx-container-gray-bx",function(event){
  $(this).find(".tut-view-btn").css("display", "none");
  $(this).removeClass('animated fadeIn');
  $(this).addClass('animated fadeOut');
  $(this).css("visibility", "hidden");
});
