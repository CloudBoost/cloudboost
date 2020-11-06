import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';

//components
import SelectRelation from './relationComponents/selectRelation.js'
import ViewRelation from './relationComponents/viewRelation.js'

class RelationTd extends React.Component {
	constructor(){
		super()
		this.state = {
			isOpenView:false,
			isOpenSelect:false
		}
	}
	componentDidMount(){
		
	}
	openCloseModal(what,which){
		this.state[which] = what
		this.setState(this.state)
	}
	handleClose(){

	}
	render() {
		let requiredClass = this.props.isRequired ? " requiredred":""
		return (
            <td className={'mdl-data-table__cell--non-numeric pointer'+requiredClass} onDoubleClick={this.openCloseModal.bind(this,true,'isOpenView')}>
            	<span className="color888 expandleftpspan">{ this.props.elementData ? this.props.elementData.id : '' }</span>
            	<i className="fa fa-expand fr expandCircle" aria-hidden="true" onClick={this.openCloseModal.bind(this,true,'isOpenView')}></i>
            	<i className="fa fa-plus fr mr10 expandCircle" aria-hidden="true" onClick={this.openCloseModal.bind(this,true,'isOpenSelect')}></i>
            	{	
	            	this.state.isOpenView ? <ViewRelation 
												elementData={ this.props.elementData }
												table={ this.props.columnType.relatedTo }
												open={ this.state.isOpenView }
												openCloseModal={ this.openCloseModal.bind(this) }
												overlay={ false }
												columnName = { this.props.columnName }
							            	/> : ''
            	}
            	{
            		this.state.isOpenSelect ? <SelectRelation 
												table={ this.props.columnType.relatedTo }
												updateObject={ this.props.updateObject }
												updateElement={ this.props.updateElement }
												open={ this.state.isOpenSelect }
												openCloseModal={ this.openCloseModal.bind(this) }
							            	/> : ''
            	}
            </td>
		);
	}
}

export default RelationTd;