import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover';
import IconButton from 'material-ui/IconButton';

import axios from 'axios';

require('./style.css');
class Notifications extends React.Component {
  static propTypes = {
    updateBeacon: PropTypes.any,
    user: PropTypes.any,
    beacons: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      open: false,
      disableSendBtn: true,
      value: ''
    };
  }

    handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({ open: true, anchorEl: event.currentTarget, feedbackSent: false });
      this.props.updateBeacon(this.props.beacons, 'dashboardFeedback');
    }

    handleRequestClose = () => {
      this.setState({ open: false });
    }

    handleChange (e) {
      let value = e.target.value;
      if (value) {
        this.setState({ disableSendBtn: false, value: value });
      } else {
        this.setState({ disableSendBtn: true, value: '' });
      }
    }

    sendFeedback () {
      if (this.state.value) {
        // post to slack webhook,  make chages here for updating webhook
        axios({
          url: 'https://hooks.slack.com/services/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',
          method: 'post',
          withCredentials: false,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: {
            'attachments': [
              {

                'fields': [
                  {
                    'title': 'Name',
                    'value': this.props.user.user.name,
                    'short': false
                  }, {
                    'title': 'Email',
                    'value': this.props.user.user.email,
                    'short': false
                  }, {
                    'title': 'Text',
                    'value': this.state.value,
                    'short': false
                  }, {
                    'title': 'From',
                    'value': 'Dashboard ',
                    'short': false
                  }
                ]
              }
            ]

          }
        }).then((res) => {
          this.setState({ value: '' });
        }, () => {
          this.setState({ value: '' });
        });

        this.setState({ feedbackSent: true, value: '' });
      }
    }

    render () {
      return (
        <div>

          <IconButton onClick={this.handleTouchTap}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='29'
              height='29'
              viewBox='0 -4 26 26'
            >
              <g fill='none' fillRule='evenodd'>
                <path fill='#9e9e9e'
                  d='M2.666 11.995a304.44 304.44 0 0 1-1.841-.776s-.41-.14-.558-.638c-.148-.498-.187-1.058 0-1.627.187-.57.558-.735.558-.735s9.626-4.07 13.64-5.43c.53-.179 1.18-.156 1.18-.156C17.607 2.702 19 6.034 19 9.9c0 3.866-1.62 6.808-3.354 6.84 0 0-.484.1-1.18-.135-2.189-.733-5.283-1.946-7.971-3.035-.114-.045-.31-.13-.338.177v.589c0 .56-.413.833-.923.627l-1.405-.566c-.51-.206-.923-.822-.923-1.378v-.63c.018-.29-.162-.362-.24-.394zM15.25 15.15c1.367 0 2.475-2.462 2.475-5.5s-1.108-5.5-2.475-5.5-2.475 2.462-2.475 5.5 1.108 5.5 2.475 5.5z'
                />
              </g>

            </svg>
          </IconButton>

          <span
            className={this.props.beacons.dashboardFeedback ? 'hide' : 'gps_ring feedback_beacon'}
            onClick={this.handleTouchTap} />

          <Popover
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            onRequestClose={this.handleRequestClose}
            className='feedbackpopover'>

            <p className='headingpop'>Feedback</p>

            <textarea cols='30'
              rows='4'
              placeholder='Your thoughts?'
              className={!this.state.feedbackSent ? 'feedback-textarea' : 'hide'}
              onChange={this.handleChange}
              value={this.state.value} />

            <br />

            <div className={!this.state.feedbackSent ? '' : 'hide'}>
              <button className='feedback-sendbtn'
                onTouchTap={this.sendFeedback}
                disabled={this.state.disableSendBtn}>
                            Send Feedback
              </button>
            </div>

            <div className={this.state.feedbackSent ? 'feedbackSent' : 'hide'}>

              <IconButton touch style={{ marginLeft: '37%', marginTop: -30 }}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='50'
                  height='50'
                  viewBox='0 -4 26 26'>
                  <g fill='none' fillRule='evenodd'>
                    <path fill='#549afc'
                      d='M2.666 11.995a304.44 304.44 0 0 1-1.841-.776s-.41-.14-.558-.638c-.148-.498-.187-1.058 0-1.627.187-.57.558-.735.558-.735s9.626-4.07 13.64-5.43c.53-.179 1.18-.156 1.18-.156C17.607 2.702 19 6.034 19 9.9c0 3.866-1.62 6.808-3.354 6.84 0 0-.484.1-1.18-.135-2.189-.733-5.283-1.946-7.971-3.035-.114-.045-.31-.13-.338.177v.589c0 .56-.413.833-.923.627l-1.405-.566c-.51-.206-.923-.822-.923-1.378v-.63c.018-.29-.162-.362-.24-.394zM15.25 15.15c1.367 0 2.475-2.462 2.475-5.5s-1.108-5.5-2.475-5.5-2.475 2.462-2.475 5.5 1.108 5.5 2.475 5.5z' />
                  </g>
                </svg>
              </IconButton>

              <span className='thanks-text'>Thanks</span>

              <span className='note-text'>We really appreciate your feedback!</span>

            </div>

          </Popover>
        </div>
      );
    }
}

export default Notifications;
