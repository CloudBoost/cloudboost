/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendEmailCampaign, showAlert } from '../../actions';
import { Button } from 'react-bootstrap';

export class EmailCampaign extends React.Component {
  static propTypes = {
    appData: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      subject: '',
      email: '',
      progress: false
    };
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

  componentWillMount () {
    // redirect if active app not found
    if (!this.props.appData.viewActive) {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    }
  }

  sendEmailCampaign = () => {
    if (this.state.subject && this.state.email) {
      this.setState({ progress: true });
      sendEmailCampaign(this.props.appData.appId, this.props.appData.masterKey, this.state.subject, this.state.email).then(() => {
        this.setState({ progress: false });
        showAlert('success', 'Email Campaign Success');
      }, (err) => {
        this.setState({ progress: false });
        let error = 'No users found';
        if (err.response.status === 500) {
          error = 'Server Error';
        }
        showAlert('error', error);
      });
    }
  }

  changeHandler = (which) => (e) => {
    this.state[which] = e.target.value;
    this.setState(this.state);
  }

  render () {
    return (
      <div className='panel-body' style={{ paddingBottom: 0, paddingTop: 41 }}>
        <h2 className='head'>Email Campaign</h2>
        <div >
          <div className='small-form-row'>
            <div className='control-label'>
              <label className='danger'>Create</label>
              <p className='label-desc'>
                                Email campaign is used to send email to all of your users.
                                You can use it for announcements or anything else you like.
              </p>
            </div>
            <div className='control'>
              <div>
                <input type='text'
                  className='form form-control'
                  placeholder='Your email subject'
                  value={this.state.subject}
                  onChange={this.changeHandler('subject')}
                />
                <textarea rows={10}
                  style={{ marginTop: 15 }}
                  type='text'
                  className='form form-control'
                  placeholder='Your email text'
                  value={this.state.email}
                  onChange={this.changeHandler('email')}
                />
                <Button style={{ marginTop: 15 }}
                  className='btn-primary'
                  onClick={this.sendEmailCampaign}
                  disabled={this.state.progress}
                >
                                    Send Campaign
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { appData: state.manageApp };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailCampaign);
