import React from 'react';
import ReactDOM from 'react-dom';
import Paper from 'material-ui/Paper';

class URLTdComponent extends React.Component {
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
		if(which){
			if(this.checkUrlValidity(e.target)){
				this.props.updateObject()
				this.state.errorShow = false
				this.state['inputHidden'] = which
			} else {
				this.state.errorShow = true
			}
		} else {
			this.state.errorShow = false
			this.state['inputHidden'] = which
		}
		this.setState(this.state)
	}
	checkUrlValidity(target){
		if(!target.value.includes('http')){
			if(target.value){
				target.value = "https://" + target.value
				this.props.updateElement(target.value)
			}
		}
		return target.checkValidity()
	}
	componentDidUpdate(){
		if(!this.state['inputHidden']){
     		ReactDOM.findDOMNode(this.refs.Input).focus()
     	}
    }
    saveKeyAction(e){
		if(e.which == 13){
			this.toggleInput(true,e)
		}
	}
    changeHandler(e){
    	this.props.updateElement(e.target.value)
    }
	render() {
		let requiredClass = this.props.isRequired ? " requiredred":""
		return (
            <td className={ this.state.inputHidden ? ('mdl-data-table__cell--non-numeric pointer'+requiredClass) : 'mdl-data-table__cell--non-numeric pointer padleftright0' } onDoubleClick={this.toggleInput.bind(this,false)}>
            	<span className={!this.state.inputHidden ? 'hide':''}>{this.props.elementData ? this.props.elementData.slice(0,30):''}</span>
            	<input ref="Input" value={this.props.elementData || ''} onChange={this.changeHandler.bind(this)} className={this.state.inputHidden ? 'hide':'form-control texttypetdinput'} onBlur={this.toggleInput.bind(this,true)} type="url" onKeyDown={ this.saveKeyAction.bind(this) }/>
            	<Paper className={!this.state.errorShow ? 'hide':'paperError'} zDepth={1}> <p className="abstext">Please enter a valid url.</p> </Paper>
            </td>
		);
	}
}

export default URLTdComponent;