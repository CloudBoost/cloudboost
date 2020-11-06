'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { fetchTables, deleteTable } from '../../actions';
import { connect } from 'react-redux';
import { Grid, Row, Col, Modal, Button } from 'react-bootstrap';
import { white } from 'material-ui/styles/colors';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Loader from 'react-dots-loader';
import 'react-dots-loader/index.css';

const iconStyles = {
  marginTop: 14,
  color: 'white',
  fontSize: '36px',
  paddingBottom: '9px'
};
const deleteLoadStyle = {
  display: 'inline-block',
  position: 'relative',
  background: 'none',
  boxShadow: 'none',
  marginLeft: '18px',
  marginRight: '18px'
};
const iconStyles1 = {
  marginTop: 14,
  color: '#333',
  fontSize: '36px',
  paddingBottom: '9px'
};

const iconStyles3 = {
  marginTop: 33,
  marginRight: 12,
  marginLeft: 12,
  marginBottom: 5,
  fontSize: 25,
  color: 'white'
};

const iconStyles4 = {
  marginTop: 12,
  marginRight: 12,
  marginLeft: 12,
  marginBottom: 5,
  fontSize: 25,
  color: 'white'
};

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'space-around'
  }
};

export class TableContainer extends React.Component {
  static propTypes = {
    tables: PropTypes.any,
    onLoad: PropTypes.any,
    activeAppId: PropTypes.any,
    deleteTable: PropTypes.any,
    masterKey: PropTypes.any,
    showAlert: PropTypes.any,
    close: PropTypes.any,
    loading: PropTypes.any,
    beacons: PropTypes.any,
    c: PropTypes.any
  }

  constructor () {
    super();
    this.state = {
      showModal: false,
      value: '',
      tableToBeDeleted: '',
      loadDelete: false
    };
  }

  componentWillMount () {
    if (this.props.tables.length === 0) {
      this.props.onLoad(this.props.activeAppId, this.props.masterKey);
    }
  }

  getIcon (tableType) {
    switch (tableType) {
      case 'role':
        return <i className='ion ion-locked' style={iconStyles} />;
      case 'user':
        return <i className='ion ion-ios-people' style={iconStyles} />;
      case 'device':
        return <i className='ion ion-iphone' style={iconStyles} />;
      default:
        return <i className='ion ion-android-list' style={iconStyles} />;
    }
  }

  redirectToTables = (tableName) => () => {
    window.location.href = window.DATABROWSER_URL + '/' + this.props.activeAppId + '/' + tableName;
  }

  onDeleteTable = () => {
    this.setState({ loadDelete: true });
    this.props.deleteTable(this.props.activeAppId, this.props.masterKey, this.state.tableToBeDeleted).then(() => {
      this.setState({ showModal: false, loadDelete: false });
    }, () => this.props.showAlert('error', 'Some error occurred.'));
  }

    openModal = (tableName) => (e) => {
      e.stopPropagation();
      this.setState({ showModal: true, tableToBeDeleted: tableName });
    };

    handleChange = e => this.setState({ value: e.target.value });

    close = () => this.setState({ showModal: false, tableToBeDeleted: '', value: '' });

    openUp () {
      this.props.close = true;
    }

    render () {
      return (
        <div style={styles.root}>
          <Modal className='small-height-modal' show={this.state.showModal} onHide={this.close}>
            <Modal.Header className='delete-modal-header-style'>
              <Modal.Title>
                <span className='modal-title-style'>Delete Table </span>
                <i className='fa fa-trash delete-modal-icon-style pull-right' />
                <div className='modal-title-inner-text'>
                                  Type the table name again to confirm deletion, i.e {this.state.tableToBeDeleted}
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input value={this.state.value}
                id='createApp'
                placeholder='Type the name of the table'
                onChange={this.handleChange}
                required />
            </Modal.Body>
            <Modal.Footer>
              {
                (this.state.tableToBeDeleted !== this.state.value)
                  ? <Button className='btn-danger' disabled>
                    <span className='createAppLabel'>Delete Table</span>
                  </Button>
                  : (this.state.loadDelete
                    ? <Button className='btn-danger' disabled>
                      <Loader size={10} distance={5} color='#ececec' style={deleteLoadStyle} />
                    </Button>
                    : <Button className='btn-danger' onClick={this.onDeleteTable}>
                                        Delete Table
                    </Button>)
              }
            </Modal.Footer>
          </Modal>

          <Grid className='tables-container'>
            <Row className='show-grid'>
              {
                this.props.loading
                  ? <RefreshIndicator
                    size={40}
                    left={-33}
                    top={106}
                    status='loading'
                    style={{ marginLeft: '50%', position: 'relative' }}
                  />
                  : this.props.tables.map(table => (
                    <Col className='table-box' key={table.id}>
                      <div className='table'
                        onClick={this.redirectToTables(table.name)}
                        id='tablesList'>
                        {this.getIcon(table.type)}
                        <p style={{ color: white }}>{table.name}</p>
                        <div className='overlay'>
                          {
                            ['Device', 'Role', 'User'].indexOf(table.name) === -1
                              ? <div>
                                <i onClick={this.redirectToTables(table.name)}
                                  className='ion ion-log-in'
                                  style={iconStyles4} />
                                <i className='ion ion-android-delete'
                                  style={iconStyles4}
                                  onClick={this.openModal(table.name)} />
                              </div>
                              : <i onClick={this.redirectToTables(table.name)}
                                className='ion ion-log-in'
                                style={iconStyles3} />
                          }
                        </div>
                      </div>
                    </Col>
                  ))
              }
              <Col className='table-box'>
                <div onClick={() => this.props.c(false)}
                  className={this.props.loading ? 'hide' : 'table'}
                  style={{
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'solid 1px #000'
                  }}>
                  <span className={this.props.beacons.firstTable
                    ? 'hide'
                    : 'gps_ring create_table_beacon'} />
                  <i className='ion ion-plus' style={iconStyles1} />
                  <p style={{ color: '#333' }}>Create Table</p>
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
      );
    }
}

const mapStateToProps = (state) => {
  let tables = state.apps.find(app => (app.appId === state.manageApp.appId)).tables;
  return {
    activeAppId: state.manageApp.appId,
    loading: state.loader.secondary_loading,
    masterKey: state.manageApp.masterKey,
    beacons: state.beacons,
    tables: tables
      ? tables
        .filter(
          t => t.name
            .toLowerCase()
            .search(state.manageApp.tableFilter ? state.manageApp.tableFilter : '') >= 0
        )
      : []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: (appId, masterKey) => dispatch(fetchTables(appId, masterKey)),
    deleteTable: (activeAppId, masterKey, name) => dispatch(deleteTable(activeAppId, masterKey, name))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TableContainer);
