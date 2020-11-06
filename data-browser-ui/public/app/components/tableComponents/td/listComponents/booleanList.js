import React from 'react';
import ReactDOM from 'react-dom';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';

class BooleanListComponent extends React.Component {
	constructor(){
		super()
		this.state = {
			
		}
	}
	updateValue(e){
		this.props.updateElementData(e.target.checked,this.props.index)
	}
	deleteValue(){
		this.props.removeFromElementData(this.props.index)
	}
	componentDidMount(){
		
	}
	render() {
		let data = this.props.data
		return (
			<div className="textlistinputcontainer">
				<Toggle
					label="Boolean Value Select"
					className='booleanlistval'
					toggled={ this.props.data ? this.props.data : false }
					onToggle={ this.updateValue.bind(this) }
				/>
				<i className="fa fa-times trashlistinputtext boollistel" aria-hidden="true" onClick={ this.deleteValue.bind(this) }></i>
			</div>
		);
	}
}

export default BooleanListComponent;