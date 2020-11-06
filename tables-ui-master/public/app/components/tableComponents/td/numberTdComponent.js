import React from 'react';
import ReactDOM from 'react-dom';

class NumberTdComponent extends React.Component {
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
		if(which){
			let string = this.props.elementData.toString()
			this.props.updateElement(parseFloat(string.replace(/[^\d.-]/g, '')))
			this.props.updateObject()
		}
		this.state['inputHidden'] = which
		this.setState(this.state)
	}
	saveKeyAction(e){
		if(e.which == 13){
			this.toggleInput(true)
		}
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
            	<span className={!this.state.inputHidden ? 'hide':''}>{this.props.elementData ? this.props.elementData.toString().slice(0,20):''}</span>
            	<input ref="Input" value={this.props.elementData || "" } onChange={this.changeHandler.bind(this)} className={this.state.inputHidden ? 'hide':'form-control texttypetdinput'} onBlur={this.toggleInput.bind(this,true)} type="text" onKeyDown={ this.saveKeyAction.bind(this) }/>
            </td>
		);
	}
}

export default NumberTdComponent;