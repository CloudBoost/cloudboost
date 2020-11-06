/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showAlert, enableMongoAccess, getAccessURL } from '../../actions';
import { makeUrlFromData, makeConnectionStringFromData, makeServerUrlFromData } from '../../helper';
import CopyToClipboard from 'react-copy-to-clipboard';
import { InputGroup, FormControl } from 'react-bootstrap';
import Upgrade from '../payment';

export class MongoAccess extends React.Component {
  static propTypes = {
    appData: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      accessUrlEnabled: false,
      showUpgradeModal: false
    };
  }

  componentWillMount () {
    this.getAccessDetails();
  }

    closeUpgradeModal = () => this.setState({ showUpgradeModal: false });

    openUpgradeModal = () => this.setState({ showUpgradeModal: true });

    enableMongoAccess = () => {
      if (this.props.appData.planId > 1) {
        enableMongoAccess(this.props.appData.appId).then((res) => {
          showAlert('success', 'Success enabling MongoDB access.');
          this.getAccessDetails();
        }, (err) => {
          console.log(err);
          showAlert('error', 'Error enabling MongoDB access.');
        });
      } else {
        this.openUpgradeModal();
      }
    }

    getAccessDetails () {
      getAccessURL(this.props.appData.appId).then((res) => {
        this.setState({
          accessUrlString: makeUrlFromData(res.data),
          connectionString: makeConnectionStringFromData(res.data),
          serverUrl: makeServerUrlFromData(res.data),
          accessUsername: res.data.data.username,
          accessPassword: res.data.data.password,
          accessUrlEnabled: true
        });
      }, (err) => {
        console.log(err);
      });
    }

    render () {
      return (
        <div style={{ paddingTop: 41, paddingLeft: 54 }}>
          <h2 className='head'>MongoDB Native Access</h2>
          <p className={this.state.accessUrlEnabled ? 'help-text ng-scope' : 'hide'}>
                    Below are parameters you might need, to gain access to your application's
                    database
          </p>
          <table className='table table-ionic table-action table-social'>
            <tbody>
              <tr className={this.state.accessUrlEnabled ? 'config-row' : 'hide'}>
                <td style={{ padding: 0 }}>
                  <div className='config-container'>
                    <div className='form-group'>
                      <label className='control-label'>Shell </label>
                      <InputGroup>
                        <FormControl type='text'
                          disabled
                          value={this.state.accessUrlString || ''}
                        />
                        <InputGroup.Addon>
                          <CopyToClipboard
                            text={this.state.accessUrlString || ''}>
                            <i className='fa fa-copy copy-icon' />
                          </CopyToClipboard>
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>
                    <div className='form-group'>
                      <label className='control-label'>Connection String</label>
                      <InputGroup>
                        <FormControl type='text'
                          disabled
                          value={this.state.connectionString || ''}
                        />
                        <InputGroup.Addon>
                          <CopyToClipboard
                            text={this.state.connectionString || ''}>
                            <i className='fa fa-copy copy-icon' />
                          </CopyToClipboard>
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>

                    <div className='form-group'>
                      <label className='control-label'>Server Url</label>
                      <InputGroup>
                        <FormControl type='text'
                          disabled
                          value={this.state.serverUrl || ''}
                        />
                        <InputGroup.Addon>
                          <CopyToClipboard text={this.state.serverUrl || ''}>
                            <i className='fa fa-copy copy-icon' />
                          </CopyToClipboard>
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>
                    <div className='form-group'>
                      <label className='control-label'>Username</label>
                      <InputGroup>
                        <FormControl type='text'
                          disabled
                          value={this.state.accessUsername || ''}
                        />
                        <InputGroup.Addon>
                          <CopyToClipboard text={this.state.accessUsername || ''}>
                            <i className='fa fa-copy copy-icon' />
                          </CopyToClipboard>
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>
                    <div className='form-group'>
                      <label className='control-label'>Password</label>
                      <InputGroup>
                        <FormControl type='text'
                          disabled
                          value={this.state.accessPassword || ''}
                        />
                        <InputGroup.Addon>
                          <CopyToClipboard
                            text={this.state.accessPassword || ''}>
                            <i className='fa fa-copy copy-icon' />
                          </CopyToClipboard>
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>
                    <div className='form-group'>
                      <label className='control-label'>Database</label>
                      <InputGroup>
                        <FormControl type='text' disabled
                          value={this.props.appData.appId || ''}
                        />
                        <InputGroup.Addon>
                          <CopyToClipboard
                            text={this.props.appData.appId || ''}>
                            <i className='fa fa-copy copy-icon' />
                          </CopyToClipboard>
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className={this.state.accessUrlEnabled ? 'hide' : ''}>
                <div className='text-center'>
                  <button className='btn btn-primary'
                    onClick={this.enableMongoAccess}>
                                Enable
                  </button>
                </div>
              </tr>
            </tbody>
          </table>
          {
            this.state.showUpgradeModal &&
              <Upgrade appId={this.props.appData.appId}
                planId={this.props.appData.planId}
                show={this.state.showUpgradeModal}
                close={this.closeUpgradeModal} />
          }
        </div>
      );
    }
}

const mapStateToProps = (state) => {
  let appData = {};
  state.apps.map(app => {
    if (app.appId === state.manageApp.appId) { appData = app; }
  });

  return { appData: appData };
};

export default connect(mapStateToProps, null)(MongoAccess);
