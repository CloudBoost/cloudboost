import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { updateQueue } from '../../actions';
import { connect } from 'react-redux';
import ACLRows from './aclRows.js';

export class ACL extends React.Component {
  static propTypes = {
    selectedQueue: PropTypes.any,
    updateQueue: PropTypes.any,
    closeACLModal: PropTypes.any,
    showACLModal: PropTypes.any
  }

  constructor () {
    super();
    this.state = {
      aclList: []
    };
  }

  componentWillMount () {
    this.generaliseACL(this.props.selectedQueue);
  }

  generaliseACL (props) {
    let users = {};
    let roles = {};
    for (let k in props.ACL.document.read.allow.user) {
      if (!users[props.ACL.document.read.allow.user[k]]) users[props.ACL.document.read.allow.user[k]] = {};
      users[props.ACL.document.read.allow.user[k]].read = true;
    }
    for (let k in props.ACL.document.read.deny.user) {
      if (!users[props.ACL.document.read.deny.user[k]]) users[props.ACL.document.read.deny.user[k]] = {};
      users[props.ACL.document.read.deny.user[k]].read = false;
    }
    for (let k in props.ACL.document.write.allow.user) {
      if (!users[props.ACL.document.write.allow.user[k]]) users[props.ACL.document.write.allow.user[k]] = {};
      users[props.ACL.document.write.allow.user[k]].write = true;
    }
    for (let k in props.ACL.document.write.deny.user) {
      if (!users[props.ACL.document.write.deny.user[k]]) users[props.ACL.document.write.deny.user[k]] = {};
      users[props.ACL.document.write.deny.user[k]].write = false;
    }

    for (let k in props.ACL.document.read.allow.role) {
      if (!roles[props.ACL.document.read.allow.role[k]]) roles[props.ACL.document.read.allow.role[k]] = {};
      roles[props.ACL.document.read.allow.role[k]].read = true;
    }
    for (let k in props.ACL.document.read.deny.role) {
      if (!roles[props.ACL.document.read.deny.role[k]]) roles[props.ACL.document.read.deny.role[k]] = {};
      roles[props.ACL.document.read.deny.role[k]].read = false;
    }
    for (let k in props.ACL.document.write.allow.role) {
      if (!roles[props.ACL.document.write.allow.role[k]]) roles[props.ACL.document.write.allow.role[k]] = {};
      roles[props.ACL.document.write.allow.role[k]].write = true;
    }
    for (let k in props.ACL.document.write.deny.role) {
      if (!roles[props.ACL.document.write.deny.role[k]]) roles[props.ACL.document.write.deny.role[k]] = {};
      roles[props.ACL.document.write.deny.role[k]].write = false;
    }

    let usersList = [];
    let rolesList = [];

    usersList = Object.keys(users).map((x) => {
      return { id: x, data: users[x], type: 'user' };
    });

    rolesList = Object.keys(roles).map((x) => {
      return { id: x, data: roles[x], type: 'role' };
    });

    this.state.aclList = [...usersList, ...rolesList];
    this.setState(this.state);
  }

  removeAcl = (id) => {
    this.state.aclList = this.state.aclList.filter(x => x.id !== id);
    this.setState(this.state);
  }

  updateAclData = (data, id) => {
    this.state.aclList = this.state.aclList.map((x) => {
      if (x.id === id) { x.data = data; }
      return x;
    });
    this.setState(this.state);
  }

  addAcl = (obj) => {
    this.state.aclList.push(obj);
    this.setState(this.state);
  }

  saveAcl = () => {
    let AClObj = new CB.ACL();
    for (var k in this.state.aclList) {
      if (this.state.aclList[k].type === 'user' && this.state.aclList[k].id !== 'all') {
        let typeRead = this.state.aclList[k].data.read || false;
        let typeWrite = this.state.aclList[k].data.write || false;
        AClObj.setUserReadAccess(this.state.aclList[k].id, typeRead);
        AClObj.setUserWriteAccess(this.state.aclList[k].id, typeWrite);
      }
      if (this.state.aclList[k].type === 'role') {
        let typeRead = this.state.aclList[k].data.read || false;
        let typeWrite = this.state.aclList[k].data.write || false;
        AClObj.setRoleReadAccess(this.state.aclList[k].id, typeRead);
        AClObj.setRoleWriteAccess(this.state.aclList[k].id, typeWrite);
      }
      if (this.state.aclList[k].id === 'all') {
        AClObj.setPublicReadAccess(this.state.aclList[k].data.read);
        AClObj.setPublicWriteAccess(this.state.aclList[k].data.write);
      }
    }
    this.props.selectedQueue.ACL = AClObj;
    this.props.updateQueue(this.props.selectedQueue);
    this.close();
  }

    close = () => {
      this.props.closeACLModal();
    };

    render () {
      return (
        <Modal show={this.props.showACLModal} onHide={this.close} dialogClassName='custom-modal'>
          <Modal.Header className='modal-header-style'>
            <Modal.Title>
              <span className='modal-title-style'>
                                Access Control List (ACL)
              </span>
              <i className='fa fa-exchange modal-icon-style pull-right' />
              <div className='modal-title-inner-text'>
                            ACL's helps you to secure your app
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: 15 }}>
            <ACLRows
              aclList={this.state.aclList}
              removeAcl={this.removeAcl}
              addAcl={this.addAcl}
              updateAclData={this.updateAclData}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Cancel</Button>
            <Button bsStyle='primary' onClick={this.saveAcl}>Save</Button>
          </Modal.Footer>
        </Modal>
      );
    }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateQueue: (selectedQueue) => dispatch(updateQueue(selectedQueue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ACL);
