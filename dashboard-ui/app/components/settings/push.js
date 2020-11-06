/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { upsertAppSettingsFile, showAlert, updateSettings } from '../../actions';

import { Button } from 'react-bootstrap';
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

export class Push extends React.Component {
  static propTypes = {
    pushSettings: PropTypes.any,
    appData: PropTypes.any,
    upsertAppSettingsFile: PropTypes.any,
    updateSettings: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      loading: true,
      android: {
        credentials: []
      },
      windows: {
        credentials: []
      },
      apple: {
        certificates: []
      }
    };
  }

  componentWillMount () {
    if (this.props.pushSettings) {
      this.setState({ ...this.props.pushSettings.settings, loading: false });
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.pushSettings) {
      this.setState({ ...nextProps.pushSettings.settings, loading: false });
    }
  }

  androidChangeHandler = (which) => (e) => {
    if (this.state.android.credentials.length === 0) {
      this.state.android.credentials.push({
        apiKey: '',
        senderId: ''
      });
    }
    this.state.android.credentials[0][which] = e.target.value;
    this.setState(this.state);
  }

  windowsChangeHandler = (which) => (e) => {
    if (this.state.windows.credentials.length === 0) {
      this.state.windows.credentials.push({
        securityId: '',
        clientSecret: ''
      });
    }
    this.state.windows.credentials[0][which] = e.target.value;
    this.setState(this.state);
  }

  changeFile = (e) => {
    let file = e.target.files[0];
    if (file.type.includes('/x-pkcs12')) {
      this.props.upsertAppSettingsFile(this.props.appData.appId, this.props.appData.masterKey, file, 'push', { ...this.state });
    } else {
      showAlert('error', 'Only .p12 type files are allowed.');
    }
  }

  openChangeFile = () => {
    document.getElementById('fileBox').click();
  }

  deleteFile = (fileId) => {
    this.setState({ apple: { certificates: [] } });
    setTimeout(() => {
      this.updateSettings();
    }, 0);
  }

  updateSettings = () => {
    let reqObj = { ...this.state };
    delete reqObj['loading'];

    this.setState(
      { loading: true },
      this.props.updateSettings(this.props.appData.appId, this.props.appData.masterKey, 'push', { ...this.state })
    );
  }

  render () {
    return (
      <div style={{ paddingTop: 41, paddingLeft: 54 }}>
        <h2 className='head'>Push Notifications Settings</h2>
        <TrasnparentLoader show={this.state.loading}
          message={<Loader size={10} distance={5} color='#ececec' style={style.refresh} />}
          contentBlur={1}
          // foregroundStyle={{foregroundColor: 'white', opacity: "0.3"}}
          backgroundStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          <div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>
                  <span className='icon-align'>
                    <i className='fa fa-apple icon'
                      aria-hidden='true' />
                  </span>
                                    &nbsp; Apple Push Certificates
                </label>
              </div>
              <div className='control'>
                <div>
                  <table className='table table-ionic table-action table-social'>
                    <tbody>
                      <tr className='single-row'>
                        <td colSpan={8} style={{ borderBottom: 0 }}>
                          <div className='small-form-row'>
                            <div className='control-label'>
                              <label className='danger'>Certificate file</label>
                              <p className='label-desc'>
                                                            Upload your .p12 certificate file to enable push
                                                            for iOS and OS X
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='row-actions'
                          style={{ verticalAlign: 'top', borderBottom: 0 }}>
                          <ul>
                            <i className={this.state.apple.certificates.length ? 'fa fa-file-o appIcon' : 'hide'}
                              aria-hidden='true' />
                            <li className='setup'
                              onClick={this.openChangeFile}
                            >
                                                        + Add Certificate
                            </li>
                            <input type='file'
                              style={{ display: 'none' }}
                              onChange={this.changeFile}
                              id='fileBox'
                            />
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>
                  <span className='icon-align'>
                    <i className='fa fa-android icon'
                      aria-hidden='true' />
                  </span>
                                    &nbsp; Android Push Credentials
                </label>
              </div>
              <div className='control'>
                <table className='table table-ionic table-action table-social'>
                  <tbody>
                    <tr className='single-row'>
                      <td colSpan={12} style={{ borderBottom: 0 }}>
                        <div className='small-form-row'>
                          <div className='control-label'>
                            <label className='danger'>Sender ID</label>
                            <p className='label-desc'>
                                                        This is an integer listed under "Project Number" in
                                                        the Google API console.
                            </p>
                          </div>
                          <div className='control'>
                            <div>
                              <input type='text'
                                className='form form-control'
                                placeholder='Enter Sender ID'
                                value={this.state.android.credentials.length ? this.state.android.credentials[0].senderId : ''}
                                onChange={this.androidChangeHandler('senderId')}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr className='single-row'>
                      <td colSpan={12} style={{ border: 0 }}>
                        <div className='small-form-row'>
                          <div className='control-label'>
                            <label className='danger'>API Key</label>
                            <p className='label-desc'>
                                                        This is listed under the "Authentication" section of
                                                        the Google API console
                            </p>
                          </div>
                          <div className='control'>
                            <div>
                              <input type='text'
                                className='form form-control'
                                placeholder='Enter API Key'
                                value={this.state.android.credentials.length ? this.state.android.credentials[0].apiKey : ''}
                                onChange={this.androidChangeHandler('apiKey')}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className='small-form-row'>
            <div className='control-label'>
              <label className='danger'>
                <span className='icon-align'>
                  <i className='fa fa-windows icon'
                    aria-hidden='true' />
                </span>
                                &nbsp; Windows Push Credentials
              </label>
            </div>
            <div className='control'>
              <div>
                <table className='table table-ionic table-action table-social'>
                  <tbody>

                    <tr className='single-row'>
                      <td colSpan={12} style={{ borderBottom: 0 }}>
                        <div className='small-form-row'>
                          <div className='control-label'>
                            <label className='danger'>Package Security Identifier
                                                        (SID)</label>
                            <p className='label-desc'>
                                                        The unique identifier of your Windows Store app.
                            </p>
                          </div>
                          <div className='control'>
                            <div>
                              <input type='text'
                                className='form form-control'
                                placeholder='Enter Security Identifier'
                                value={this.state.windows.credentials.length ? this.state.windows.credentials[0].securityId : ''}
                                onChange={this.windowsChangeHandler('securityId')}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr className='single-row'>
                      <td colSpan={12} style={{ borderTop: 0 }}>
                        <div className='small-form-row'>
                          <div className='control-label'>
                            <label className='danger'>Client Secret</label>
                            <p className='label-desc'>
                                                        The secret key
                            </p>
                          </div>
                          <div className='control'>
                            <div>
                              <input type='text'
                                className='form form-control'
                                placeholder='Enter Client Secret'
                                value={this.state.windows.credentials.length ? this.state.windows.credentials[0].clientSecret : ''}
                                onChange={this.windowsChangeHandler('clientSecret')}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TrasnparentLoader>

        <div>
          <div className='small-form-row'>
            <div className='control'>
              <div>
                <Button style={{ marginTop: 15 }}
                  className={!this.state.loading ? 'btn-primary' : 'btn-primary btnloading'}
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
  let pushSettings = null;
  if (state.settings.length) {
    pushSettings = state.settings.filter(x => x.category === 'push')[0];
  }

  return {
    appData: state.manageApp,
    pushSettings: pushSettings
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    upsertAppSettingsFile: (appId, masterKey, fileObj, category, settingsObject) => dispatch(upsertAppSettingsFile(appId, masterKey, fileObj, category, settingsObject)),
    updateSettings: (appId, masterKey, categoryName, settingsObject) => dispatch(updateSettings(appId, masterKey, categoryName, settingsObject))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Push);
