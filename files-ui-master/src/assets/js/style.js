$(document).ready(function() {

    $(".side-menu-items:first-child").addClass("side-item-selected");
    $(".side-menu-items").click(function() {
        $(this).addClass("side-item-selected");
        $(this).siblings().removeClass("side-item-selected");
    });
    $(".popover-list-item").click(function() {
        $("#popover-trigger-click-root-close").hide();
    });
});
