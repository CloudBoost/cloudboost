import React from 'react';
import ReactDOM from 'react-dom';

class PasswordListComponent extends React.Component {
	constructor(){
		super()
		this.state = {
			
		}
	}
	updateValue(e){
		this.props.updateElementData(e.target.value,this.props.index)
	}
	addNewRowToList(e){
		if(e.which === 13){
			this.props.addToElementData(false)
			setTimeout(()=>{
				// blur the currebt input and focus the last added input
				$('.listtexttableinput').blur()
				$('.listtexttableinput')[$('.listtexttableinput').length-1].focus()
			},0)
		}
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
				<input type="password" className="listtexttableinput" value={ this.props.data } onChange={ this.updateValue.bind(this) } placeholder="Enter Encrypted text." onKeyDown={this.addNewRowToList.bind(this)}/>
				<i className="fa fa-times trashlistinputtext" aria-hidden="true" onClick={ this.deleteValue.bind(this) }></i>
			</div>
		);
	}
}

export default PasswordListComponent;