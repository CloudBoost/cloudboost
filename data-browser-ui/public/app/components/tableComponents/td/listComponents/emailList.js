import React from 'react';
import ReactDOM from 'react-dom';
import Paper from 'material-ui/Paper';

class EmailListComponent extends React.Component {
	constructor(){
		super()
		this.state = {}
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
	blurHandler(){
		let x = this.props.data ||  ''
	    let atpos = x.indexOf("@")
	    let dotpos = x.lastIndexOf(".")
	    if ((atpos < 1 || dotpos<atpos+2 || dotpos+2>=x.length) && x != '' && x != null && x.length) {
	        this.state.errorShow = true
	        this.setState(this.state)
	    } else {
	    	this.state.errorShow = false
	    	this.setState(this.state)
	    }
	}
    changeHandler(e){
        this.props.updateElementData(e.target.value,this.props.index)
    }
    deleteValue(){
		this.props.removeFromElementData(this.props.index)
	}
	render() {
		return (
            <div className="textlistinputcontainer">
                <input className="listtexttableinput" placeholder="Please enter a valid email." type="email" 
                    value={this.props.data} 
                    onChange={this.changeHandler.bind(this)} 
                    onKeyDown={this.addNewRowToList.bind(this)}
                    onBlur={this.blurHandler.bind(this,true)} />
                <i className="fa fa-times trashlistinputtext" aria-hidden="true" onClick={ this.deleteValue.bind(this) }></i>
                <Paper className={!this.state.errorShow ? 'hide':'paperError'} zDepth={1}> <p className="abstext">Enter valid email</p> </Paper>
            </div>
		);
	}
}

export default EmailListComponent;