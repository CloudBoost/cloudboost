import React from 'react';
import ReactDOM from 'react-dom';

class Id extends React.Component {
	constructor(){
		super()
		this.state = {

		}
	}
	componentDidMount(){
		
	}
    changeHandler(e){
    	this.props.updateElementData(e.target.value,this.props.columnData.name)
    }
	render() {
		return (
			<div className="textRaltion">
				<span className="textnamerlation"> { this.props.columnData.name } </span>
            	<input value={this.props.elementData || ''} disabled="true" className="textinputrltion" type="text" />
            </div>
		);
	}
}

export default Id;