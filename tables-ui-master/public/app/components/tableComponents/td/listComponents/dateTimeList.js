import React from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

class DateTimeListComponent extends React.Component {
	constructor(){
		super()
		this.state = {
			
		}
	}
	deleteValue(){
		this.props.removeFromElementData(this.props.index)
	}
	openInput(which){
		this.refs[which].openDialog()
	}
	viewChangeDate(e,data){
		let date = new Date(this.props.data)
		date.setDate(data.getDate())
		date.setFullYear(data.getFullYear())
		date.setMonth(data.getMonth())
		this.props.updateElementData(date,this.props.index)
	}
	dateFormat(date){
		return new Date(date).toISOString().slice(0,10).replace(/-/g,"/") + ", " + new Date(date).getHours()+":"+new Date(date).getMinutes()
	}
	componentDidMount(){
		
	}
	render() {
		let data = this.props.data
		let currentDate = this.props.data ? new Date(this.props.data) : new Date()
		return (
			<div className="textlistinputcontainer">
				<span className='fl datetimevaluelsist'>{ this.dateFormat(this.props.data) }</span>
				<i className="fa fa-times trashlistinputdate" aria-hidden="true" onClick={ this.deleteValue.bind(this) }></i>
            	<i className="fa fa-calendar dateml" aria-hidden="true" onClick={this.openInput.bind(this,'InputDate')}></i>
				
            	<DatePicker id="date" ref="InputDate" className='pofixedvishide' onChange={this.viewChangeDate.bind(this)} value={currentDate} style={{zIndex:3000}} container="inline"/>
            	
			</div>
		);
	}
}

export default DateTimeListComponent;