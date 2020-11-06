/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showAlert, sendPushCampaign } from '../../actions';
import SelectAudience from './selectAudience';
import { Button } from 'react-bootstrap';

export class PushCampaign extends React.Component {
  static propTypes = {
    appData: PropTypes.any
  }
  constructor (props) {
    super(props);

    this.state = {
      message: '',
      title: '',
      progress: false,
      query: null,
      totalAudience: 0,
      os: [],
      channels: []

    };
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

  componentWillMount () {
    // redirect if active app not found
    if (!this.props.appData.viewActive) {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    } else {
      let query = new CB.CloudQuery('Device');
      query.find().then((data) => {
        this.setState({ totalAudience: data.length });
      }, (err) => {
        console.log(err);
      });
    }
  }

  sendPushCampaign = () => {
    if (this.state.message) {
      this.setState({ progress: true });
      let messageObject = {
        message: this.state.message,
        title: this.state.title || ''
      };
      sendPushCampaign(messageObject, this.state.query).then(() => {
        this.setState({ progress: false });
        showAlert('success', 'Push Campaign Success');
      }, (err) => {
        this.setState({ progress: false });
        let error = err.response.data || 'No users found';
        if (err.response.status === 500) {
          error = 'Server Error';
        }
        showAlert('error', error);
      });
    } else { showAlert('error', 'Please enter a message.'); }
  }

  buildQuery = (query, os, channels) => {
    this.setState({ query: query, os: os, channels: channels });
    if (query) {
      query.find().then((data) => {
        this.setState({ totalAudience: data.length });
      }, () => {
        showAlert('error', 'Select Audience Error');
      });
    }
  }

  changeHandler = (which) => (e) => {
    this.state[which] = e.target.value;
    this.setState(this.state);
  }

    launchAudienceModal = () => this.audienceModal.open();

    render () {
      return (
        <div className='panel-body'>
          <h2 className='head'>Push Notifications</h2>
          <div >
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>Create push campaign</label>
                <p className='label-desc'>
                                The best campaigns use short and direct messaging.
                </p>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Title'
                    value={this.state.title}
                    onChange={this.changeHandler('title')}
                  />
                  <textarea rows={3}
                    style={{ marginTop: 15 }}
                    type='text'
                    className='form form-control'
                    placeholder='Message'
                    value={this.state.message}
                    onChange={this.changeHandler('message')}
                  />
                </div>
              </div>
            </div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>Target your audience</label>
                <p className='label-desc'>
                                Send to everyone, or use an audience to target the right users
                </p>
              </div>
              <div className='control'>
                <div>
                  <table className='table table-ionic table-action table-social'>
                    <tbody>
                      <tr className='single-row'>
                        <td colSpan={2}>
                          <span className='icon-align'>
                            <i className='fa fa-hashtag icon' aria-hidden='true' />
                          </span>
                                            Channel
                        </td>
                        <td />
                        <td />
                        <td className='row-actions'>
                          <ul onClick={this.launchAudienceModal}>{
                            this.state.channels.length > 0
                              ? this.state.channels.map((x, i) => (
                                <li><span key={i} className='active-label'>{x}</span></li>
                              ))
                              : <li><span className='active-label'>All Channels</span></li>
                          }</ul>
                        </td>
                      </tr>

                      <tr className='single-row'>
                        <td colSpan={2}>
                          <span className='icon-align'>
                            <i className='fa fa-apple icon' aria-hidden='true' />
                          </span>
                                            OS
                        </td>
                        <td />
                        <td />
                        <td className='row-actions'>
                          <ul onClick={this.launchAudienceModal}>{
                            this.state.os.length > 0 && this.state.os.length < 6
                              ? this.state.os.map((x, i) => (
                                <li><span key={i} className='active-label'>{x}</span></li>
                              ))
                              : <li><span className='active-label'>All OS</span></li>
                          }</ul>
                        </td>
                      </tr>
                      <tr className='single-row'>
                        <td colSpan={2} className='inactive'>
                                            AUDIENCE SIZE - {this.state.totalAudience}
                        </td>
                        <td />
                        <td />
                        <td className='row-actions'>
                          <SelectAudience ref={(c) => { this.audienceModal = c; }}
                            buildQuery={this.buildQuery} type='modify' />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div >
            <div className='small-form-row'>
              <div className='control'>
                <div>
                  <Button style={{ marginTop: 15 }}
                    className='btn-primary'
                    disabled={this.state.progress}
                    onClick={this.sendPushCampaign}
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

export default connect(mapStateToProps, mapDispatchToProps)(PushCampaign);
