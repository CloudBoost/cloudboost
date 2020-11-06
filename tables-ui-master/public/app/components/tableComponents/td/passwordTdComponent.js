import React from 'react';
import ReactDOM from 'react-dom';

class PasswordTdComponent extends React.Component {
	constructor(){
		super()
		this.state = {}
	}
	componentDidMount(){
		this.state = {
			inputHidden:true
		}
		this.setState(this.state)
	}
	toggleInput(which,e){
		e.preventDefault()
		if(which){
			this.props.updateObject()
		} else {
			ReactDOM.findDOMNode(this.refs.Input).value = ''
		}
		this.state['inputHidden'] = which
		this.setState(this.state)
	}
	blurHandler(){
		ReactDOM.findDOMNode(this.refs.FormSubmitButton).click()
	}
	componentDidUpdate(){
		if(!this.state['inputHidden']){
     		ReactDOM.findDOMNode(this.refs.Input).focus()
     	}
    }
    changeHandler(e){
    	this.props.updateElement(e.target.value)
    }
	render() {
		let requiredClass = this.props.isRequired ? " requiredred":""
		return (
            <td className={ this.state.inputHidden ? ('mdl-data-table__cell--non-numeric pointer'+requiredClass) : 'mdl-data-table__cell--non-numeric pointer padleftright0' } onDoubleClick={this.toggleInput.bind(this,false)}>
            	<form onSubmit={this.toggleInput.bind(this,true)}>
	            	<span className={!this.state.inputHidden ? 'hide':'color888'}>hidden</span>
	            	<input ref="Input" onChange={this.changeHandler.bind(this)} className={this.state.inputHidden ? 'hide':'form-control texttypetdinput'} onBlur={this.blurHandler.bind(this,true)} type="text" />
	            	<button ref="FormSubmitButton" type="submit" className="hide"></button>
            	</form>
            </td>
		);
	}
}

export default PasswordTdComponent;