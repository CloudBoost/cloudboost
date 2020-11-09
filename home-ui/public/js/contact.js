$(document).ready(function() {
    
    /* ======= jQuery form validator ======= */ 
    /* Ref: http://jqueryvalidation.org/documentation/ */   
    $("#contact-form").validate({
		messages: {
		
		    name: {
    			required: 'Please enter your name' //You can customise this message
			},
			email: {
				required: 'Please enter your email' //You can customise this message
			},			
			message: {
				required: 'Please enter your message' //You can customise this message
			}
			
		}
		
	});
	
	
});



