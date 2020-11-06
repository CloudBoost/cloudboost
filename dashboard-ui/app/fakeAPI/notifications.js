export default [
  {
    type: 'noaction',
    text: 'Leave a feedback.',
    icon: 'http://www.freeiconspng.com/uploads/feedback-icon-0.png',
    seen: false,
    meta: {}
  }, {
    type: 'oneaction',
    text: 'Yeah! I just got one action!!',
    meta: {
      acceptButton: {
        text: 'Cool',
        method: 'post',
        url: 'http://www.testing.com/ok',
        external: true,
        payload: {
          key: 'value'
        }
      }
    },
    seen: false
  }, {
    type: 'twoaction',
    notificationType: 'payment',
    text: 'Some large text. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. Some large text again. ',
    meta: {
      cancelButton: {
        text: 'Decline',
        method: 'post',
        external: false,
        url: '/cancel',
        payload: {
          key: 'value'
        }
      },
      acceptButton: {
        text: 'Accept',
        method: 'get',
        external: false,
        url: 'http://www.testing.com/accept',
        payload: {
          key: 'value'
        },
        appId: 'hvkxtbgbpikc',
        planId: 1
      }
    },
    icon: 'https://img.clipartfest.com/925898b903a4d9182622fda48f870f66_welcome-to-our-room-with-a-twitter-logo-clipart-png_1139-926.png',
    seen: false
  }, {
    type: 'noaction',
    text: 'I am a link. <a href="http://google.com">Click here !!</a>',
    icon: 'http://www.freeiconspng.com/uploads/facebook-transparent-logo-png-0.png',
    seen: false,
    meta: {}
  }, {
    type: 'oneaction',
    text: 'Yeah! I just got one action!!',
    meta: {
      acceptButton: {
        text: 'Cool',
        method: 'post',
        url: 'http://www.testing.com/ok',
        external: true,
        payload: {
          key: 'value'
        }
      }
    },
    seen: false
  }, {
    type: 'twoaction',
    text: 'Best one.',
    meta: {
      cancelButton: {
        text: 'I reject',
        method: 'post',
        external: false,
        url: 'http://www.testing.com/cancel',
        payload: {
          key: 'value'
        }
      },
      acceptButton: {
        text: 'I accept',
        method: 'get',
        external: true,
        url: 'http://www.testing.com/accept',
        payload: {
          key: 'value'
        }
      }
    },
    icon: 'https://img.clipartfest.com/925898b903a4d9182622fda48f870f66_welcome-to-our-room-with-a-twitter-logo-clipart-png_1139-926.png',
    seen: false
  }
];
