import React from 'react';
import ReactDOM from 'react-dom';
import {TableRowColumn} from 'material-ui/Table';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

class DateTdComponent extends React.Component {
	constructor(){
		super()
		this.state = {
			dateOpen:false,
			timeOpen:false
		}
	}
	componentDidMount(){

	}
	openInput(which){
		if(which == 'InputTime'){
			this.state.timeOpen = true
		}
		if(which == 'InputDate'){
			this.state.dateOpen = true
		}
		this.setState(this.state,()=>{
			this.refs[which].openDialog()
		})
	}
	viewChangeDate(e,data){
		let date = new Date(this.props.elementData)
		date.setDate(data.getDate())
		date.setFullYear(data.getFullYear())
		date.setMonth(data.getMonth())
		this.props.updateElement(date.toISOString())
		this.props.updateObject()
		this.state.timeOpen = false
		this.state.dateOpen = false
		this.setState(this.state)
	}
	viewChangeTime(e,data){
		let date = new Date(this.props.elementData)
		date.setHours(data.getHours())
		date.setMinutes(data.getMinutes())
		date.setSeconds(data.getSeconds())
		this.props.updateElement(date.toISOString())
		this.props.updateObject()
		this.state.timeOpen = false
		this.state.dateOpen = false
		this.setState(this.state)
	}
	dateFormat(date){
		if(date)
			return new Date(date).toISOString().slice(0,10).replace(/-/g,"/") + ", " + new Date(date).getHours()+":"+new Date(date).getMinutes()
	}
	render() {
		let date = ''
		let time = ''
		let requiredClass = this.props.isRequired ? " requiredred":""
		let currentDate = this.props.elementData ? new Date(this.props.elementData) : new Date()
		if(this.state.dateOpen){
			date = <DatePicker id="date" ref="InputDate" className='width0' onChange={this.viewChangeDate.bind(this)} value={currentDate}/>
		}
		if(this.state.timeOpen){
			time = <TimePicker id="time" ref="InputTime" className='width0' onChange={this.viewChangeTime.bind(this)}/>
		}
		return (
            <td className={'mdl-data-table__cell--non-numeric pointer'+requiredClass} onDoubleClick={this.openInput.bind(this,'InputDate')}>
            	<span className={''}>{ this.dateFormat(this.props.elementData) }</span>
              <span>
                <i className="fa fa-calendar fr mtl2" aria-hidden="true" onClick={this.openInput.bind(this,'InputDate')}></i>
                <i className="fa fa-clock-o fr mtl2" aria-hidden="true" onClick={this.openInput.bind(this,'InputTime')}></i>
              </span>
            	{ date }
            	{ time }
            </td>
		);
	}
}

export default DateTdComponent;
