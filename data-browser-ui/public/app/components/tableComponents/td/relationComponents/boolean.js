import React from 'react'
import ReactDOM from 'react-dom'
import Checkbox from 'material-ui/Checkbox'

class BooleanC extends React.Component {
	constructor(){
		super()
		this.state = {

		}
	}
	componentDidMount(){
		
	}
    checkHandler(e,data){
    	this.props.updateElementData(data,this.props.columnData.name)
	}
	render() {
		return (
			<div className="halfreldiv">
				<span className="textnamerlation"> { this.props.columnData.name } </span>
				<Checkbox className='relationrowcheckbox' onCheck={this.checkHandler.bind(this)} checked={this.props.elementData || false}/>
            </div>
		);
	}
}

export default BooleanC;