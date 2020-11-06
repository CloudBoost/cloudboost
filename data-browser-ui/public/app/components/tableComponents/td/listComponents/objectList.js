import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

class ObjectListComponent extends React.Component {
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
	deleteValue(){
		this.props.removeFromElementData(this.props.index)
	}
	changeHandler(value,e){
		try{
    		this.props.updateElementData(JSON.parse(value),this.props.index)
    	} catch(e){
    		console.log(e)
    	}
    }
	render() {
		let data = this.props.data
		return (
			<div className="textlistinputcontainer">
				<Dialog title="JSON EDITOR" modal={false} open={this.state.isModalOpen} onRequestClose={this.openCloseModal.bind(this,false)}titleClassName="modaltitle" style={{zIndex:3000}}>
	          		<AceEditor
					    mode="json"
					    theme="github"
					    onChange={this.changeHandler.bind(this)}
					    value={ JSON.stringify(this.props.data) || '' }
					    name="json"
					    className="jsonmodal"
					/>
	          		<button className="btn btn-primary fr ml5" onClick={this.openCloseModal.bind(this,false)}>Submit</button>
        		</Dialog>
				<div className="listtexttableinput cp" onClick={ this.openCloseModal.bind(this,true) }>
					{
						JSON.stringify(this.props.data)
					}
				</div>
				<i className="fa fa-times trashlistinputtext" aria-hidden="true" onClick={ this.deleteValue.bind(this) }></i>
			</div>
		);
	}
}

export default ObjectListComponent;