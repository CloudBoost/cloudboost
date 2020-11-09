var countries_length = list_of_countries.length;
if(!__isDevelopment) {
  mixpanel.track('Visted Resource Page', {
    "visited": "visited Resource Page"
  });
  amplitude.getInstance().logEvent('Visted Whitepaper Page', {
    "visited": "visited Resource Page"
  });
}

$(document).ready(function() {
  var options;
  var whitepaper_user = {};
  for (var i = 0; i < countries_length; i++) {
    options += '<option value=\"' + list_of_countries[i] +'\">' + list_of_countries[i] + '</option>';
  }
  $('#selectCountry').append(options);

  var $whitepaper_fields = $('#firstName, #lastName, #salesEmail, #jobTitle, #company, #companySize, #phoneNo, #selectCountry, #interestedFor');

  $whitepaper_fields.on('change focusout keyup', function(e) {
    var $this = $(this);
    var classname = $this[0].id;
    if ($this.val() === '') {
      $('.help-block').removeClass('visible').addClass('hidden');
      $('.' + classname).removeClass('hidden').addClass('visible');
    }
    if ($this.val() !== '') {
      $('.' + classname).removeClass('visible').addClass('hidden');
    }
    if (checkAllFields())
      $('#requestWhitePaperBtn').prop('disabled', false);
    else
      $('#requestWhitePaperBtn').prop('disabled', true);
    whitepaper_user[classname] = $this.val();
  });

  $('#requestWhitePaperBtn').click(function(e) {
    e.preventDefault();
    if(!__isDevelopment) {
      mixpanel.track('Clicked Request Resource Button', {
        "clicked": "Request Resource Button"
      });
      amplitude.getInstance().logEvent('Clicked Request Resource Button', {
        "clicked": "Request Resource Button"
      });
    }
    whitepaper_user['wantToSubscribe'] = $('#wantToSubscribe').prop('checked');
    requestWhitePaper(whitepaper_user).then(function(message) {
      $whitepaper_fields.val(null);
      $('.whitepaper-message').removeClass('visible').addClass('hidden');
      window.location.href = '/enterprise/resources/thank-you';
    }, function(status) {
      $('.whitepaper-message').removeClass('hidden').addClass('visible');
    });
    console.log(whitepaper_user);
  });
});

var requestWhitePaper = function(sendJson) {
  console.log('White Paper Requested');
  var url = window.location.href;
  var type = url.split('/')[5];
  var slug = url.split('/')[6];

  var q = Q.defer();

  $.ajax({
    type: "POST",
    url: serverURL + '/resources/' + type + '/' + slug,
    data: sendJson,
    success: function(msg) {
      console.log(msg);
      q.resolve("Thank you! We'll reach out to you soon.");
    },
    error: function(error) {
      console.log(error);
      q.reject("You've already requested for a demo, OR something went wrong with us");
    }
  });

  return q.promise;
}

function checkAllFields() {
  return ($('#firstName').val() !== '' && $('#lastName').val() !== '' && $('#salesEmail').val() !== '' && $('#jobTitle').val() !== '' && $('#company').val() !== '' && $('#companySize').val() !== '' && $('#phoneNo').val() !== '' && $('#selectCountry').val() !== '' && $('#interestedFor').val() !== '');
}
