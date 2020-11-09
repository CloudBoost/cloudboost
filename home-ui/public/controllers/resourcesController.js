if(!__isDevelopment) {
  mixpanel.track('Visted Resource Page', {
    "visited": "visited Resource Page"
  });
  amplitude.getInstance().logEvent('Visted Resource Page', {
    "visited": "visited Resource Page"
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