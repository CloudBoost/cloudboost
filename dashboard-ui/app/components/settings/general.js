/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { upsertAppSettingsFile, showAlert, updateSettings } from '../../actions';

// mui
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

export class General extends React.Component {
  static propTypes = {
    generalSettings: PropTypes.any,
    appData: PropTypes.any,
    upsertAppSettingsFile: PropTypes.any,
    updateSettings: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      appIcon: null,
      appInProduction: false,
      isAppDisabled: false,
      appName: null,
      loading: true
    };
  }

  componentWillMount () {
    if (this.props.generalSettings) {
      this.setState({ ...this.props.generalSettings.settings,
        loading: false,
        isAppDisabled: this.props.appData.disabled
      });
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.generalSettings) {
      this.setState({ ...nextProps.generalSettings.settings,
        loading: false,
        isAppDisabled: nextProps.appData.disabled
      });
    }
  }

  textChangeHandler = (which) => (e) => {
    this.state[which] = e.target.value;
    this.setState(this.state);
  }

  toggleChangeHandler = (which) => (e, val) => {
    this.state[which] = val;
    this.setState(this.state);
  }

  changeFile = (e) => {
    let file = e.target.files[0];
    if (file.type.includes('/png')) {
      this.props.upsertAppSettingsFile(this.props.appData.appId, this.props.appData.masterKey, file, 'general', {
        ...this.state
      });
    } else {
      showAlert('error', 'Only .png type images are allowed.');
    }
  }

  openChangeFile = () => {
    document.getElementById('fileBox').click();
  }

  deleteFile = (fileId) => {
    this.setState({ appIcon: null });
    setTimeout(() => {
      this.updateSettings();
    }, 0);
  }

  updateSettings () {
    let reqObj = { ...this.state };
    delete reqObj['loading'];
    this.setState(
      { loading: true },
      this.props.updateSettings(this.props.appData.appId, this.props.appData.masterKey, 'general', reqObj)
    );
  }

  render () {
    return (
      <div style={{ paddingTop: 41, paddingLeft: 54 }}>
        <h2 className='head'>General Settings</h2>

        <TrasnparentLoader show={this.state.loading}
          message={
            <Loader size={10} distance={5} color='#ececec' style={style.refresh} />}
          contentBlur={1}
          // foregroundStyle={{foregroundColor: 'white', opacity: "0.3"}}
          backgroundStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          <div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>App Name</label>
              </div>
              <div className='control'>
                <div>
                  <input type='text'
                    className='form form-control'
                    placeholder='Enter App Name'
                    value={this.state.appName || ''}
                    onChange={this.textChangeHandler('appName')}
                  />
                </div>
              </div>
            </div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>App Icon</label>
                <p className='label-desc'>
                                    Upload your own app icon to replace the default app icon
                </p>
              </div>
              <div className='control'>
                <div className='icon-preview'>
                  <img src={this.state.appIcon ? this.state.appIcon : ''}
                    className={this.state.appIcon ? 'appIcon' : 'hide'}
                    style={{ height: 64, width: 64 }}
                  />
                </div>
                <div className='icon-actions'>
                  <input type='file'
                    id='iconFile'
                    className='file-control'
                    name='icon'
                    onChange={this.changeFile}
                  />
                </div>
              </div>
            </div>
            {/* <div className="small-form-row">
                            <div className="control-label">
                                <label className="danger">App In Production</label>
                                <p className="label-desc">Is your app in production?</p>
                            </div>
                            <div className="control">
                                <Toggle className="togglegeneral"
                                        onToggle={this.toggleChangeHandler('appInProduction')}
                                        toggled={this.state.appInProduction}
                                />
                            </div>
                        </div> */}
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
                    this.state.loading && <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
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

// const mapStateToProps = (state) => {
//   let generalSettings = null;
//   if (state.settings.length) {
//     generalSettings = state.settings.filter(x => x.category == 'general')[0];
//   }

//   return { appData: state.manageApp, generalSettings: generalSettings };
// };

const mapDispatchToProps = (dispatch) => {
  return {
    upsertAppSettingsFile: (appId, masterKey, fileObj, category, settingsObject) => dispatch(upsertAppSettingsFile(appId, masterKey, fileObj, category, settingsObject)),
    updateSettings: (appId, masterKey, categoryName, settingsObject) => dispatch(updateSettings(appId, masterKey, categoryName, settingsObject))
  };
};

export default connect(null, mapDispatchToProps)(General);
