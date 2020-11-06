import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';

import ACLRows from './aclComponents/aclRows.js'
import ViewACL from './aclComponents/viewAcl.js'

class ACLTd extends React.Component {
	constructor(){
		super()
		this.state = {
			isOpenACL:false,
			aclList:[]
		}
	}
	componentWillMount(){
		this.generaliseACL(this.props)
	}
	componentWillReceiveProps(props){
		this.generaliseACL(props)
	}
	generaliseACL(props){
		let users = {}
		let roles = {}
		if(props.elementData.document.read){
			for(var k in props.elementData.document.read.allow.user){
				if(!users[props.elementData.document.read.allow.user[k]]) users[props.elementData.document.read.allow.user[k]] = {}
				users[props.elementData.document.read.allow.user[k]].read = true
			}
			for(var k in props.elementData.document.read.deny.user){
				if(!users[props.elementData.document.read.deny.user[k]]) users[props.elementData.document.read.deny.user[k]] = {}
				users[props.elementData.document.read.deny.user[k]].read = false
			}
			for(var k in props.elementData.document.write.allow.user){
				if(!users[props.elementData.document.write.allow.user[k]]) users[props.elementData.document.write.allow.user[k]] = {}
				users[props.elementData.document.write.allow.user[k]].write = true
			}
			for(var k in props.elementData.document.write.deny.user){
				if(!users[props.elementData.document.write.deny.user[k]]) users[props.elementData.document.write.deny.user[k]] = {}
				users[props.elementData.document.write.deny.user[k]].write = false
			}

			for(var k in props.elementData.document.read.allow.role){
				if(!roles[props.elementData.document.read.allow.role[k]]) roles[props.elementData.document.read.allow.role[k]] = {}
				roles[props.elementData.document.read.allow.role[k]].read = true
			}
			for(var k in props.elementData.document.read.deny.role){
				if(!roles[props.elementData.document.read.deny.role[k]]) roles[props.elementData.document.read.deny.role[k]] = {}
				roles[props.elementData.document.read.deny.role[k]].read = false
			}
			for(var k in props.elementData.document.write.allow.role){
				if(!roles[props.elementData.document.write.allow.role[k]]) roles[props.elementData.document.write.allow.role[k]] = {}
				roles[props.elementData.document.write.allow.role[k]].write = true
			}
			for(var k in props.elementData.document.write.deny.role){
				if(!roles[props.elementData.document.write.deny.role[k]]) roles[props.elementData.document.write.deny.role[k]] = {}
				roles[props.elementData.document.write.deny.role[k]].write = false
			}

			let usersList = []
			let rolesList = []
			usersList = Object.keys(users).map((x)=>{
				return {
					id:x,
					data:users[x],
					type:'user'
				}
			})
			rolesList = Object.keys(roles).map((x)=>{
				return {
					id:x,
					data:roles[x],
					type:'role'
				}
			})
			this.state.aclList = [...usersList,...rolesList]
			this.setState(this.state)
		}
	}
	removeAcl(id){
		this.state.aclList = this.state.aclList.filter(x => x.id != id)
		this.setState(this.state)
	}
	updateAclData(data,id){
		this.state.aclList = this.state.aclList.map((x)=>{
			if(x.id == id){
				x.data = data
			}
			return x
		})
		this.setState(this.state)
	}
	addAcl(obj){
		this.state.aclList.push(obj)
		this.setState(this.state)
	}
	cancelAcl(){
		this.props.fetchObject()
		this.openCloseModal(false)
	}
	saveAcl(){
		let AClObj = new CB.ACL()
		for(var k in this.state.aclList){
			if(this.state.aclList[k].type == 'user' && this.state.aclList[k].id != 'all'){
				let typeRead = this.state.aclList[k].data.read || false
				let typeWrite = this.state.aclList[k].data.write || false
				AClObj.setUserReadAccess(this.state.aclList[k].id,typeRead)
				AClObj.setUserWriteAccess(this.state.aclList[k].id,typeWrite)
			}
			if(this.state.aclList[k].type == 'role'){
				let typeRead = this.state.aclList[k].data.read || false
				let typeWrite = this.state.aclList[k].data.write || false
				AClObj.setRoleReadAccess(this.state.aclList[k].id,typeRead)
				AClObj.setRoleWriteAccess(this.state.aclList[k].id,typeWrite)
			}
			if(this.state.aclList[k].id == 'all'){
				AClObj.setPublicReadAccess(this.state.aclList[k].data.read)
				AClObj.setPublicWriteAccess(this.state.aclList[k].data.write)
			}
		}
		this.props.updateElement(AClObj)
		this.props.updateObject()
		this.openCloseModal(false)
	}
	openCloseModal(what){
		this.state['isOpenACL'] = what
		this.setState(this.state)
	}
	render() {
		let dialogTitle = <div className="modaltitle">
							<span className="diadlogTitleText">Access Control List</span>
							<span className="diadlogTitleTextSub">Manage who can access this document.</span>
							<i className='fa fa-lock iconmodal'></i>
						</div>
		return (
            <td className='mdl-data-table__cell--non-numeric pointer' onDoubleClick={this.openCloseModal.bind(this,true)}>
            	<ViewACL aclList={ this.state.aclList }/>
            	<i className="fa fa-expand fr expandCircle" aria-hidden="true" onClick={this.openCloseModal.bind(this,true)}></i>
            	{	
	            	this.state.isOpenACL ? <Dialog bodyClassName={"bodyClassNameACL"} contentClassName={"acloverlay"} title={ dialogTitle } modal={false} open={this.state.isOpenACL} onRequestClose={this.cancelAcl.bind(this)}>
								        		<ACLRows 
								        			aclList={ this.state.aclList }
								        			removeAcl={ this.removeAcl.bind(this) }
								        			addAcl={ this.addAcl.bind(this) }
								        			updateAclData={ this.updateAclData.bind(this) }
								        		/>
								        		<div className="cancelselctacl">
									          			<button className="btn btn-primary fr" onClick={this.saveAcl.bind(this)}>Save</button>
									          	</div>
								    		</Dialog> : ''
            	}
            </td>
		);
	}
}

export default ACLTd;