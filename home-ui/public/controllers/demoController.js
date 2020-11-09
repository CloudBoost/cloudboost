var countries_length = list_of_countries.length;

if(!__isDevelopment) {
  mixpanel.track('Visted Enterprise Demo Page', {
    "visited": "visited Enterprise Demo Page"
  });
  amplitude.getInstance().logEvent('Visted Enterprise Demo Page', {
    "visited": "visited Enterprise Demo Page"
  });
}

$(document).ready(function() {
  var options;
  var demo_user = {};
  for (var i = 0; i < countries_length; i++) {
    options += '<option value=\"' + list_of_countries[i] +'\">' + list_of_countries[i] + '</option>';
  }
  $('#selectCountry').append(options);

  var $demo_fields = $('#firstName, #lastName, #salesEmail, #jobTitle, #company, #companySize, #phoneNo, #selectCountry, #interestedFor');

  $demo_fields.on('change focusout keyup', function(e) {
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
      $('#requestDemoBtn').prop('disabled', false);
    else
      $('#requestDemoBtn').prop('disabled', true);
    demo_user[classname] = $this.val();
  });

  $('#requestDemoBtn').click(function(e) {
    e.preventDefault();
    if(!__isDevelopment) {
      mixpanel.track('Clicked Request Demo Button', {
        "clicked": "Request Demo Button"
      });
      amplitude.getInstance().logEvent('Clicked Request Demo Button', {
        "clicked": "Request Demo Button"
      });
    }
    demo_user['wantToSubscribe'] = $('#wantToSubscribe').prop('checked');
    requestDemo(demo_user).then(function(message) {
      $demo_fields.val(null);
      $('.demo-message').removeClass('visible').addClass('hidden');
      window.location.href = '/enterprise/demo/thank-you';
    }, function(status) {
      $('.demo-message').removeClass('hidden').addClass('visible');
    });
  });
});

var requestDemo = function(sendJson) {
  var q = Q.defer();
  console.log('Demo Requested');
  $.ajax({
    type: "POST",
    url: serverURL + '/requestDemo',
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
