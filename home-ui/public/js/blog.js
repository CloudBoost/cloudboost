$(document).ready(function() {
    
    /* ======= Blog Featured Post Slideshow - Flexslider ======= */ 
    $('.blog-slider').flexslider({
        animation: "fade",
        slideshowSpeed: 8000
    });
    
   
    /* ======= Blog page masonry ======= */
    /* Ref: http://desandro.github.io/masonry/index.html */
    
    var $container = $('#blog-mansonry');
    $container.imagesLoaded(function(){
        $container.masonry({
            itemSelector : '.post'
        });
    });
    
   /* ======= Blog page searchbox ======= */
   /* Ref: http://thecodeblock.com/expanding-search-bar-with-jquery-tutroial/ */
    var submitIcon = $('.searchbox-icon');
    var inputBox = $('.searchbox-input');
    var searchBox = $('.searchbox');
    var isOpen = false;
    submitIcon.on('click', function(){
        if(isOpen === false){
            searchBox.addClass('searchbox-open');
            inputBox.focus();
            isOpen = true;
        } else {
            searchBox.removeClass('searchbox-open');
            inputBox.focusout();
            isOpen = false;
        }
    }); 
    
    submitIcon.mouseup(function(){
        return false;
    });
    searchBox.mouseup(function(){
        return false;
    });
    $(document).mouseup(function(){
        if(isOpen === true){
            $('.searchbox-icon').css('display','block');
            submitIcon.click();
        }
    });
    
    function buttonUp(){
        var inputVal = $('.searchbox-input').val();
        inputVal = $.trim(inputVal).length;
        if( inputVal !== 0){
            $('.searchbox-icon').css('display','none');
        } else {
            $('.searchbox-input').val('');
            $('.searchbox-icon').css('display','block');
        }
    }
    
    inputBox.keyup(function() {
        buttonUp();
    });
    
    //Make sure the "Go" button is not shown when resize the browser window from mobile to desktop
    $(window).resize(function(){
        $('.searchbox-icon').css('display','block');
        searchBox.removeClass('searchbox-open');        
    });

    
});



