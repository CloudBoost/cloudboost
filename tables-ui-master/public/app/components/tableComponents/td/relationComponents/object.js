import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

class ObjectC extends React.Component {
	constructor(){
		super()
		this.state = {
			isModalOpen:false
		}
	}
	componentDidMount(){
		
	}
	openCloseModal(what){
		this.state.isModalOpen = what
		this.setState(this.state)
	}
	changeHandler(value,e){
		try{
    		this.props.updateElementData(JSON.parse(value),this.props.columnData.name)
    	} catch(e){
    		console.log(e)
    	}
    }
	cancelJsonUpdate(){
		this.openCloseModal(false)
	}
	handleClose(){

	}
	render() {
		return (
			<div className="halfreldiv ">
				<span className="textnamerlation"> { this.props.columnData.name } </span>
				<span className="color888 spanrelcustom">JSON Object</span>
				<i className="fa fa-expand fr filerle cp" aria-hidden="true" onClick={this.openCloseModal.bind(this,true)}></i>
            	<Dialog title="JSON EDITOR" modal={false} open={this.state.isModalOpen} onRequestClose={this.cancelJsonUpdate.bind(this)} titleClassName="modaltitle">
	          		<AceEditor
					    mode="json"
					    theme="github"
					    onChange={this.changeHandler.bind(this)}
					    value={ JSON.stringify(this.props.elementData) || '' }
					    name="json"
					    className="jsonmodal"
					/>
	          		<button className="btn btn-primary fr" onClick={this.cancelJsonUpdate.bind(this)}>Submit</button>
        		</Dialog>
            </div>
		);
	}
}

export default ObjectC;