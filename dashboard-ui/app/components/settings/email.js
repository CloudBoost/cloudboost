/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showAlert, updateSettings } from '../../actions';

// mui
import { FormGroup, Radio, Button } from 'react-bootstrap';
import TrasnparentLoader from 'react-loader-advanced';
import Loader from 'react-dots-loader';
import 'react-dots-loader/index.css';

const style = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    background: 'none',
    boxShadow: 'none',
    marginLeft: '18px',
    marginRight: '18px'
  }
};

export class Email extends React.Component {
  static propTypes = {
    emailSettings: PropTypes.any,
    appData: PropTypes.any,
    updateSettings: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      loading: true,
      mandrill: {
        apiKey: null,
        enabled: true
      },
      mailgun: {
        apiKey: null,
        domain: null,
        enabled: false
      },
      fromEmail: null,
      fromName: null
    };
  }

  componentWillMount () {
    if (this.props.emailSettings) {
      this.setState({ ...this.props.emailSettings.settings, loading: false });
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.emailSettings) {
      this.setState({ ...nextProps.emailSettings.settings, loading: false });
    }
  }

  textChangeHandler = (which) => (e) => {
    this.state[which] = e.target.value;
    this.setState(this.state);
  }

  mailKeysChangeHandler = (mailType, which) => (e) => {
    this.state[mailType][which] = e.target.value;
    this.setState(this.state);
  }

  selectMailType = (val) => {
    if (val === 'mandrill') {
      this.setState({
        mandrill: {
          enabled: true
        },
        mailgun: {
          enabled: false
        }
      });
    } else {
      this.setState({
        mandrill: {
          enabled: false
        },
        mailgun: {
          enabled: true
        }
      });
    }
  }

  updateSettings = () => {
    let reqObj = { ...this.state };
    delete reqObj['loading'];

    if (this.state.mandrill.enabled) {
      if (this.state.mandrill.apiKey && this.state.fromName && this.state.fromEmail) {
        this.setState(
          { loading: true },
          this.props.updateSettings(this.props.appData.appId, this.props.appData.masterKey, 'email', reqObj)
        );
      } else showAlert('error', 'Please fill all the fields.');
    } else {
      if (this.state.mailgun.apiKey && this.state.mailgun.domain && this.state.fromName && this.state.fromEmail) {
        this.setState(
          { loading: true },
          this.props.updateSettings(this.props.appData.appId, this.props.appData.masterKey, 'email', reqObj)
        );
      } else showAlert('error', 'Please fill all the fields.');
    }
  }

  render () {
    return (
      <div style={{ paddingBottom: 0, paddingTop: 41, paddingLeft: 54 }}>
        <h2 className='head'>Email Settings</h2>
        <TrasnparentLoader show={this.state.loading}
          message={<Loader
            style={{ marginLeft: '50%', position: 'relative' }}
          />}
          contentBlur={1}
          // foregroundStyle={{foregroundColor: 'white', opacity: "0.3"}}
          backgroundStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          <div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>Create</label>
                <p className='label-desc'>
                                    Choose an email provider that you want to send emails with
                </p>
              </div>
              <div className='control'>
                <div>
                  <FormGroup>
                    <Radio inline
                      name='radioGroup'
                      onChange={() => this.selectMailType('mandrill')}
                      checked={this.state.mandrill.enabled}>
                                            Mandrill
                    </Radio>
                    {' '}
                    <Radio name='radioGroup'
                      inline
                      onChange={() => this.selectMailType('mailgun')}
                      checked={this.state.mailgun.enabled}>
                                            Mailgun
                    </Radio>
                    {' '}
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className={this.state.mandrill.enabled ? 'small-form-row' : 'hide'}>
              <div className='control-label'>
                <label className='danger'>Mandrill API Key</label>
                <p className='label-desc'>
                                    API Key of Mandrill email service.
                </p>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Enter Mandrill API Key'
                    value={this.state.mandrill.apiKey || ''}
                    onChange={this.mailKeysChangeHandler('mandrill', 'apiKey')}
                  />
                </div>
              </div>
            </div>
            <div className={this.state.mailgun.enabled ? 'small-form-row' : 'hide'}>
              <div className='control-label'>
                <label className='danger'>Mailgun API Key</label>
                <p className='label-desc'>
                                    API Key of Mailgun email service
                </p>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Enter Mailgun API Key'
                    value={this.state.mailgun.apiKey || ''}
                    onChange={this.mailKeysChangeHandler('mailgun', 'apiKey')}
                  />
                </div>
              </div>
            </div>
            <div className={this.state.mailgun.enabled ? 'small-form-row' : 'hide'}>
              <div className='control-label'>
                <label className='danger'>Mailgun Domain</label>
                <p className='label-desc'>
                                    Domain listed in your Mailgun Dashboard
                </p>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Enter Mandrill API Key'
                    value={this.state.mailgun.domain || ''}
                    onChange={this.mailKeysChangeHandler('mailgun', 'domain')}
                  />
                </div>
              </div>
            </div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>From Email</label>
                <p className='label-desc'>
                                    Email address which you want an email to be sent from
                </p>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Enter From Email'
                    value={this.state.fromEmail || ''}
                    onChange={this.textChangeHandler('fromEmail')}
                  />
                </div>
              </div>
            </div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>From Name</label>
                <p className='label-desc'>
                                    Name you want an email to be sent from
                </p>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Enter From Email'
                    value={this.state.fromName || ''}
                    onChange={this.textChangeHandler('fromName')}
                  />
                </div>
              </div>
            </div>
          </div>
        </TrasnparentLoader>
        <div>
          <div className='small-form-row'>
            <div className='control'>
              <div>
                <Button style={{ marginTop: 15 }}
                  className={!this.state.loading ? 'btn-primary' : 'btn-primary'}
                  onClick={this.updateSettings}
                  disabled={this.state.loading}
                >
                                    Save
                  {
                    this.state.loading &&
                    <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
                  }
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
  let emailSettings = null;
  if (state.settings.length) {
    emailSettings = state.settings.filter(x => x.category === 'email')[0];
  }

  return {
    appData: state.manageApp,
    emailSettings: emailSettings
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSettings: (appId, masterKey, categoryName, settingsObject) => dispatch(updateSettings(appId, masterKey, categoryName, settingsObject))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Email);
