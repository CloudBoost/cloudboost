import React from 'react';
import ReactDOM from 'react-dom';
import Paper from 'material-ui/Paper';

class EmailTdComponent extends React.Component {
	constructor(){
		super()
		this.state = {}
	}
	componentDidMount(){
		this.state = {
			inputHidden:true,
			errorShow:false
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
		let x = this.props.elementData || ''
	    let atpos = x.indexOf("@")
	    let dotpos = x.lastIndexOf(".")
	    if ((atpos < 1 || dotpos<atpos+2 || dotpos+2>=x.length) && x != '' && x != null && x.length) {
	        this.state.errorShow = true
	        this.setState(this.state)
	    } else {
	    	this.state.errorShow = false
	    	this.setState(this.state)
	    	ReactDOM.findDOMNode(this.refs.FormSubmitButton).click()
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
            	<form onSubmit={this.toggleInput.bind(this,true)}>
	            	<span className={!this.state.inputHidden ? 'hide':''}>{this.props.elementData ? this.props.elementData.slice(0,20):''}</span>
            		<input ref="Input" value={this.props.elementData || ''} onChange={this.changeHandler.bind(this)} className={this.state.inputHidden ? 'hide':'form-control texttypetdinput'} onBlur={this.blurHandler.bind(this,true)} type="email" />
            		<Paper className={!this.state.errorShow ? 'hide':'paperError'} zDepth={1}> <p className="abstext">Please enter a valid email address.</p> </Paper>
	            	<button ref="FormSubmitButton" type="submit" className="hide"></button>
            	</form>
            </td>
		);
	}
}

export default EmailTdComponent;