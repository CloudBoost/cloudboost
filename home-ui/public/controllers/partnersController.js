$(document).ready(function() {
  $("#pform-wyl-sbmtng").hide();
  $("#pform-sbmt-success").text("");
  $("#sbmt-partnr-btn").click(function() {
    var companyName = $("#pform-companyname").val();
    var companyDescription = $("#pform-companydescri").val();
    var personName = $("#pform-personname").val();
    var companyEmail = $("#pform-companyemail").val();
    var companyContact = $("#pform-companycontact").val();
    var personMobile = $("#pform-personmobile").val();
    var companyAddress = $("#pform-companyaddrs").val();
    var companyWebsite = $("#pform-companywebsite").val();
    var companyCountry = $("#pform-companycntry").val();
    var appSpecilizedIn = $("#pform-apps").val();
    var companySize = $("#pform-companysize").val();

    $("#pform-sbmt-error").text("");
    $("#pform-sbmt-success").text("");
    var validateMsg = _validateFields(companyName, companyDescription, personName, companyEmail, companyContact, personMobile, companyAddress, companyWebsite, companyCountry, appSpecilizedIn, companySize);

    if (validateMsg) {
      $("#pform-sbmt-error").text("ERROR: " + validateMsg);
    }
    if (!validateMsg) {

      var partnerForm = {
        companyName: companyName,
        companyDescription: companyDescription,
        personName: personName,
        companyEmail: companyEmail,
        companyContact: companyContact,
        personMobile: personMobile,
        companyAddress: companyAddress,
        companyWebsite: companyWebsite,
        companyCountry: companyCountry,
        appSpecilizedIn: appSpecilizedIn,
        companySize: companySize
      };

      $("#pform-bfr-sbmt").hide();
      $("#pform-wyl-sbmtng").show();

      $.ajax({
        type: "POST",
        url: serverURL + '/partner',
        'data': partnerForm,
        success: function(result, status, xhr) {

          $("#pform-bfr-sbmt").show();
          $("#pform-wyl-sbmtng").hide();

          var successMsg = "Thank you for your interest in our partner program. One of our partner support monkeys will reach out to you soon and help you get on-board.";
          $("#pform-sbmt-success").text(successMsg);

          partnerForm.partnerId = result.id;
          if (!__isDevelopment) {
            mixpanel.track('Partner Submitted Form', partnerForm);
            amplitude.getInstance().logEvent('Partner Submitted Form', partnerForm);
          }
        },
        error: function(xhr, status, error) {
          var errorResp = "Something went wrong, try again."
          if (xhr && xhr.responseText) {
            try {
              var errorJson = JSON.parse(xhr.responseText);
              if (errorJson.Error) {
                errorResp = errorJson.Error;
              }
            } catch (e) {}
          }

          $("#pform-bfr-sbmt").show();
          $("#pform-wyl-sbmtng").hide();
          $("#pform-sbmt-error").text("ERROR: " + errorResp);
        }
      });
    }

  });
});


function _validateFields(companyName, companyDescription, personName, companyEmail, companyContact, personMobile, companyAddress, companyWebsite, companyCountry, appSpecilizedIn, companySize, acceptedCbAgreement) {
  if (!companyName || companyName == "") {
    return "Company Name is required."
  }

  if (!companyDescription || companyDescription == "") {
    return "Company Description is required."
  }

  if (!personName || personName == "") {
    return "Person's Name is required."
  }

  if (!companyEmail || companyEmail == "") {
    return "Business Email is required."
  }

  if (companyEmail && !_emailValidation(companyEmail)) {
    return "Business Email is invalid."
  }

  if (!companyContact || companyContact == "") {
    return "Business Contact is required."
  }

  if (!personMobile || personMobile == "") {
    return "Person's Contact is required."
  }

  if (!companyAddress || companyAddress == "") {
    return "Company's Address is required."
  }

  if (!companyWebsite || companyWebsite == "") {
    return "Company's Website is required."
  }

  if (companyWebsite && companyWebsite != "" && !isUrl(companyWebsite)) {
    return "Company's Website is invalid."
  }

  if (!companyCountry || companyCountry == "") {
    return "Company's Country is required."
  }

  if (!appSpecilizedIn || appSpecilizedIn == "") {
    return "Apps Specialized In is required."
  }

  if (!companySize || companySize == "") {
    return "Company's Size is required."
  }

  if (companySize && companySize != "" && !_numberValidation(companySize)) {
    return "Company's Size is invalid, it should be number."
  }

  if (!$("#cbagrmnt").is(":checked")) {
    return "Need to Accept CloudBoost Agreement."
  }

  return null;
}

function _emailValidation(email) {
  var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

  if (!filter.test(email)) {
    return false;
  }

  return true;
}

function _numberValidation(number) {
  try {
    number = parseInt(number);
  } catch (e) {}

  if (isNaN(number)) {
    return false;
  }

  return true;
}

function isUrl(url) {

  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  return regexp.test(url);

}
