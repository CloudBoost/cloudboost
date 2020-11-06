import React from 'react';
import ReactDOM from 'react-dom';
import ViewRelation from '../relationComponents/viewRelation.js'

class RelationListComponent extends React.Component {
	constructor(){
		super()
		this.state = {
			isOpenView:false
		}
	}
	updateValue(e){
		this.props.updateElementData(e.target.value,this.props.index)
	}
	deleteValue(){
		this.props.removeFromElementData(this.props.index)
	}
	openCloseModal(what,which){
		this.state[which] = what
		this.setState(this.state)
	}
	componentDidMount(){
		
	}
	render() {
		let data = this.props.data
		return (
			<div className="textlistinputcontainer">
				<div className="listtexttableinput cp" onClick={ this.openCloseModal.bind(this,true) } onClick={this.openCloseModal.bind(this,true,'isOpenView')}>
					{ this.props.data ? this.props.data.id : 'unassigned' }
				</div>
				<i className="fa fa-times trashlistinputtext" aria-hidden="true" onClick={ this.deleteValue.bind(this) }></i>
				{	
	            	this.state.isOpenView ? <ViewRelation 
												elementData={ this.props.data }
												table={ this.props.columnType }
												open={ this.state.isOpenView }
												openCloseModal={ this.openCloseModal.bind(this) }
												overlay={ false }
							            	/> : ''
            	}
			</div>
		);
	}
}

export default RelationListComponent;