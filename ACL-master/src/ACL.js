import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button } from 'react-bootstrap';
import ACLRows from './aclRows.js'

// mui dependencies
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class ACL extends React.Component {
	constructor() {
		super()
		this.state = {
			aclList: []
		}
	}
	componentWillMount() {
		this.generaliseACL(this.props.objectWithACL)
	}
	generaliseACL(props) {
		let ACL = props.ACL.document ? props.ACL.document : props.ACL
		let users = {}
		let roles = {}
		for (var k in ACL.read.allow.user) {
			if (!users[ACL.read.allow.user[k]]) users[ACL.read.allow.user[k]] = {}
			users[ACL.read.allow.user[k]].read = true
		}
		for (var k in ACL.read.deny.user) {
			if (!users[ACL.read.deny.user[k]]) users[ACL.read.deny.user[k]] = {}
			users[ACL.read.deny.user[k]].read = false
		}
		for (var k in ACL.write.allow.user) {
			if (!users[ACL.write.allow.user[k]]) users[ACL.write.allow.user[k]] = {}
			users[ACL.write.allow.user[k]].write = true
		}
		for (var k in ACL.write.deny.user) {
			if (!users[ACL.write.deny.user[k]]) users[ACL.write.deny.user[k]] = {}
			users[ACL.write.deny.user[k]].write = false
		}

		for (var k in ACL.read.allow.role) {
			if (!roles[ACL.read.allow.role[k]]) roles[ACL.read.allow.role[k]] = {}
			roles[ACL.read.allow.role[k]].read = true
		}
		for (var k in ACL.read.deny.role) {
			if (!roles[ACL.read.deny.role[k]]) roles[ACL.read.deny.role[k]] = {}
			roles[ACL.read.deny.role[k]].read = false
		}
		for (var k in ACL.write.allow.role) {
			if (!roles[ACL.write.allow.role[k]]) roles[ACL.write.allow.role[k]] = {}
			roles[ACL.write.allow.role[k]].write = true
		}
		for (var k in ACL.write.deny.role) {
			if (!roles[ACL.write.deny.role[k]]) roles[ACL.write.deny.role[k]] = {}
			roles[ACL.write.deny.role[k]].write = false
		}

		let usersList = []
		let rolesList = []
		usersList = Object.keys(users).map((x) => {
			return {
				id: x,
				data: users[x],
				type: 'user'
			}
		})
		rolesList = Object.keys(roles).map((x) => {
			return {
				id: x,
				data: roles[x],
				type: 'role'
			}
		})
		this.state.aclList = [...usersList, ...rolesList]
		this.setState(this.state)
	}
	removeAcl(id) {
		this.state.aclList = this.state.aclList.filter(x => x.id != id)
		this.setState(this.state)
	}
	updateAclData(data, id) {
		this.state.aclList = this.state.aclList.map((x) => {
			if (x.id == id) {
				x.data = data
			}
			return x
		})
		this.setState(this.state)
	}
	addAcl(obj) {
		this.state.aclList.push(obj)
		this.setState(this.state)
	}
	saveAcl() {
		let AClObj = new CB.ACL()
		for (var k in this.state.aclList) {
			if (this.state.aclList[k].type == 'user' && this.state.aclList[k].id != 'all') {
				let typeRead = this.state.aclList[k].data.read || false
				let typeWrite = this.state.aclList[k].data.write || false
				AClObj.setUserReadAccess(this.state.aclList[k].id, typeRead)
				AClObj.setUserWriteAccess(this.state.aclList[k].id, typeWrite)
			}
			if (this.state.aclList[k].type == 'role') {
				let typeRead = this.state.aclList[k].data.read || false
				let typeWrite = this.state.aclList[k].data.write || false
				AClObj.setRoleReadAccess(this.state.aclList[k].id, typeRead)
				AClObj.setRoleWriteAccess(this.state.aclList[k].id, typeWrite)
			}
			if (this.state.aclList[k].id == 'all') {
				AClObj.setPublicReadAccess(this.state.aclList[k].data.read)
				AClObj.setPublicWriteAccess(this.state.aclList[k].data.write)
			}
		}
		this.props.objectWithACL.ACL = AClObj
		this.props.onACLSave(this.props.objectWithACL)
		this.close()
	}
	close = () => {
		this.props.closeACLModal()
	}
	render() {

		return (
			<Modal show={this.props.isOpenACLModal} onHide={this.close} dialogClassName={this.props.dialogClassName ? this.props.dialogClassName : "custom-modal"}>
				<Modal.Header closeButton>
					<Modal.Title>Edit ACL</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<MuiThemeProvider>
						<ACLRows
							aclList={this.state.aclList}
							removeAcl={this.removeAcl.bind(this)}
							addAcl={this.addAcl.bind(this)}
							updateAclData={this.updateAclData.bind(this)}
						/>
					</MuiThemeProvider>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close}>Cancel</Button>
					<Button bsStyle="primary" onClick={this.saveAcl.bind(this)}>Save</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

// module.exports = ACL
export default ACL