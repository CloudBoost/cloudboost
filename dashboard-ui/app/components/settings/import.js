/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showAlert, exportDatabase, importDatabase } from '../../actions';
import Upgrade from '../payment';

export class ImportExport extends React.Component {
  static propTypes = {
    currentUser: PropTypes.any,
    appData: PropTypes.any,
    importDatabase: PropTypes.any,
    exportDatabase: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = { showUpgradeModal: false };
  }

    closeUpgradeModal = () => this.setState({ showUpgradeModal: false });

    openUpgradeModal = () => this.setState({ showUpgradeModal: true });

    isAppAdmin = () => {
      if (this.props.currentUser.user) {
        return this.props.appData.developers.filter((x) => x.userId === this.props.currentUser.user._id && x.role === 'Admin').length;
      } else { return false; }
    }

    changeFile = (e) => {
      let file = e.target.files[0];
      if (file.type.includes('/json')) {
        this.props.importDatabase(this.props.appData.appId, this.props.appData.keys.master, file);
      } else {
        showAlert('error', 'Only .json type files are allowed.');
      }
    }

    openChangeFile = () => {
      if (this.isAppAdmin()) {
        this.props.appData.planId === 1 ? this.openUpgradeModal() : document.getElementById('fileBoximport').click();
      } else {
        showAlert('error', `Only admin's are allowed to export/import data.`);
      }
    }

    exportDatabase = () => {
      if (this.isAppAdmin()) {
        this.props.appData.planId === 1 ? this.openUpgradeModal() : this.props.exportDatabase(this.props.appData.appId, this.props.appData.keys.master);
      } else {
        showAlert('error', `Only admin's are allowed to export/import data.`);
      }
    }

    render () {
      return (
        <div style={{ paddingTop: 41, paddingLeft: 54 }}>
          <h2 className='head'>Import / Export Data</h2>
          <div>
            <div className='small-form-row'>
              <div className='control-label'>
                <label className='danger'>
                  <span className='icon-align'>
                    <i className='fa fa-upload icon'
                      aria-hidden='true' />
                  </span>
                                &nbsp; Import Data
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
                              <label className='danger'>Data file</label>
                              <p className='label-desc'>
                                                        Upload your .json data file to import your data
                                                        into the database. This will delete all your
                                                        existing data
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='row-actions'
                          style={{ verticalAlign: 'top', borderBottom: 0 }}>
                          <ul>
                            <li className={this.isAppAdmin() ? 'setup' : 'setup-disabled'}
                              onClick={this.openChangeFile}
                            >
                                                    + Select .json file
                            </li>
                            <input type='file'
                              style={{ display: 'none' }}
                              onChange={this.changeFile}
                              id='fileBoximport' />
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
                    <i className='fa fa-download icon'
                      aria-hidden='true' />
                  </span>
                                &nbsp; Export Data
                </label>
              </div>
              <div className='control'>
                <table className='table table-ionic table-action table-social'>
                  <tbody>
                    <tr className='single-row'>
                      <td colSpan={12}>
                        <div className='small-form-row'>
                          <div className='control-label'>
                            <label className='danger'>Export Data</label>
                            <p className='label-desc'>
                                                    By clicking on export button, your CloudBoost App
                                                    data will be exported to a .json file
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='row-actions' style={{ verticalAlign: 'top' }}>
                        <ul>
                          <li className={this.isAppAdmin() ? 'setup' : 'setup-disabled'}
                            onClick={this.exportDatabase}
                          >
                                                Export
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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

const mapStateToProps = state => {
  // TODO: change manageApps shape to contain appInfo as is returned from server, instead of running loop everytime.
  let appData = {};
  state.apps.map(app => {
    if (app.appId === state.manageApp.appId) { appData = app; }
  });

  return {
    appData: appData,
    currentUser: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    exportDatabase: (appId, masterKey) => dispatch(exportDatabase(appId, masterKey)),
    importDatabase: (appId, masterKey, fileObj) => dispatch(importDatabase(appId, masterKey, fileObj))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportExport);
