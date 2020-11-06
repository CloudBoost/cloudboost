import React from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

class DateC extends React.Component {
	constructor(){
		super()
		this.state = {

		}
	}
	componentDidMount(){
		
	}
	openInput(which){
		this.refs[which].openDialog()
	}
	viewChangeDate(e,data){
		let date = new Date(this.props.elementData)
		date.setDate(data.getDate())
		date.setFullYear(data.getFullYear())
		date.setMonth(data.getMonth())
		this.props.updateElementData(date.toISOString(),this.props.columnData.name)
	}
	viewChangeTime(e,data){
		let date = new Date(this.props.elementData)
		date.setHours(data.getHours())
		date.setMinutes(data.getMinutes())
		date.setSeconds(data.getSeconds())
		this.props.updateElementData(date.toISOString(),this.props.columnData.name)
	}
	dateFormat(date){
		return new Date(date).toISOString().slice(0,10).replace(/-/g,"/") + ", " + new Date(date).getHours()+":"+new Date(date).getMinutes()
	}
    changeHandler(e){
    	
    }
	render() {
		let currentDate = this.props.elementData ? new Date(this.props.elementData) : new Date()
		return (
			<div className="textRaltion">
				<span className="textnamerlation"> { this.props.columnData.name } </span>
				<div className="textinputrltion">
					<span className={''}>{ this.dateFormat(this.props.elementData) }</span>
	            	<i className="fa fa-calendar fr mtl2 cp" aria-hidden="true" onClick={this.openInput.bind(this,'InputDate')}></i>
	            	<i className="fa fa-clock-o fr mtl2 cp" aria-hidden="true" onClick={this.openInput.bind(this,'InputTime')}></i>
	            	<DatePicker id="date" ref="InputDate" className='width0' onChange={this.viewChangeDate.bind(this)} value={currentDate}/>
	            	<TimePicker id="time" ref="InputTime" className='width0' onChange={this.viewChangeTime.bind(this)}/>
            	</div>
            </div>
		);
	}
}

export default DateC;