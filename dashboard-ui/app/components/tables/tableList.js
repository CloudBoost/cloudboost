/**
 * Created by Darkstar on 1/2/2017.
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, FormGroup, InputGroup, Modal, Button } from 'react-bootstrap';
import TablesContainer from './tableContainer';
import { createTable, setTableSearchFilter, updateBeacon, showAlert } from '../../actions';
import { connect } from 'react-redux';
import _ from 'underscore';
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

const formStyle = {
  border: 'none',
  background: '#FFF',
  fontFamily: "'FontAwesome',sans-serif"
};

export class TableList extends React.Component {
  static propTypes = {
    tables: PropTypes.any,
    updateBeacon: PropTypes.any,
    beacons: PropTypes.any,
    dispatch: PropTypes.any,
    masterKey: PropTypes.any,
    activeAppId: PropTypes.any,
    setTableSearchFilter: PropTypes.any,
    showAlert: PropTypes.any,
    loading: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      value: ''
    };
  }

  close = () => this.setState({ showModal: false, value: '' });

  open = () => {
    return this.setState({ showModal: true });
  }

  handleChange = (e) => {
    return this.setState({ value: e.target.value });
  }

  validateTableName (value = '', tableList = []) {
    const isContainPattern = new RegExp(/\W|_/);
    const isContainDigit = new RegExp(/\d+/);
    const isContainSpace = new RegExp(/\s+/);

    // Validating Table Name & Generating Errors
    if (value === '') {
      return 'Table Name cannot be empty.';
    } else if (isContainDigit.test(value[0])) {
      return 'Table Name cannot start with number.';
    } else if (isContainSpace.test(value)) {
      return 'Table Name cannot contain spaces.';
    } else if (isContainPattern.test(value)) {
      return 'Table Name cannot contain special characters.';
    } else {
      let sameTableName = _.filter(tableList, function (table) {
        return table.name.toLowerCase() === value.toLowerCase();
      });

      if (sameTableName.length > 0) {
        return 'Table Name already exists.';
      }
    }

    return true; // Table name is valid.
  }

  onCreateTable = () => {
    let { value } = this.state;

    const isValidTableName = this.validateTableName(value, this.props.tables);

    if (isValidTableName === true) {
      this.props.updateBeacon(this.props.beacons, 'firstTable');
      this.props.dispatch(createTable(this.props.activeAppId, this.props.masterKey, this.state.value)).then(() => {
        this.setState({ showModal: false, value: '' });
      }, () => this.setState({ showModal: false, value: '' }));
    } else {
      return this.props.showAlert('error', isValidTableName);
    }
  }
  handleKeyChange = (e) => {
    if (e.keyCode === 13) { this.onCreateTable(); }
  }

  render () {
    return (
      <div className='tables'>

        <div className='tables-head'>
          <FormGroup>
            <InputGroup className='search'>
              <FormControl type='text'
                style={formStyle}
                placeholder='&#xF002;&nbsp;&nbsp;Search'
                value={this.state.searchQueue}
                onChange={(e) => this.props.setTableSearchFilter(e.target.value)}
              />
            </InputGroup>
          </FormGroup>

          <Modal className='small-height-modal' show={this.state.showModal} onHide={this.close}>
            <Modal.Header className='modal-header-style'>
              <Modal.Title>

                <span className='modal-title-style'>
                                        New Table
                </span>
                <i className='fa fa-table modal-icon-style pull-right' />
                <div className='modal-title-inner-text'>
                                        Create a new table.
                </div>
              </Modal.Title>

            </Modal.Header>
            <Modal.Body>
              <input value={this.state.value}
                id='createApp'
                placeholder='Pick a good name'
                onChange={this.handleChange}
                onKeyUp={this.handleKeyChange}
                required />
            </Modal.Body>
            <Modal.Footer>
              {this.props.loading
                ? <Button className='btn-primary create-btn ' disabled>
                  <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
                </Button>
                : <Button className='btn-primary create-btn' onClick={this.onCreateTable}>
                  <span className='createAppLabel'>Create Table</span>
                </Button>
              }
            </Modal.Footer>
          </Modal>

        </div>
        <TablesContainer c={this.open} close={this.state.showModal} />

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let tables = state.apps.filter(app => (app.appId === state.manageApp.appId))[0].tables;

  return {
    activeAppId: state.manageApp.appId,
    masterKey: state.manageApp.masterKey,
    name: state.manageApp.name,
    beacons: state.beacons,
    loading: state.loader.modal_loading,
    tables: tables
      ? tables.filter(t => t.name.toLowerCase().search(state.manageApp.tableFilter
        ? state.manageApp.tableFilter
        : '') >= 0)
      : []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createTable: (activeAppId, masterKey, name) => dispatch(createTable(activeAppId, masterKey, name)),
    setTableSearchFilter: (filter) => dispatch(setTableSearchFilter(filter)),
    updateBeacon: (beacons, field) => dispatch(updateBeacon(beacons, field)),
    showAlert,
    dispatch
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableList);
