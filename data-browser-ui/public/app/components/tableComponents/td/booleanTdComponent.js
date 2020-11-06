import React from 'react';
import ReactDOM from 'react-dom';
import Checkbox from 'material-ui/Checkbox';

class BooleanTdComponent extends React.Component {
	constructor(){
		super()
		this.state = {}
	}
    changeHandler(e,data){
    	this.props.updateElement(data)
    	this.props.updateObject()
    }
	render() {
		let requiredClass = this.props.isRequired ? " requiredred":""
		return (
            <td className={'mdl-data-table__cell--non-numeric pointer'+requiredClass}>
            	<Checkbox
			      className='booleantdcheck'
			      onCheck={ this.changeHandler.bind(this) }
			      checked={ this.props.elementData ? this.props.elementData : false }
			    />
            </td>
		);
	}
}

export default BooleanTdComponent;