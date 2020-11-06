import React from 'react';
import ReactDOM from 'react-dom';
import configObject from '../../config/app.js'
import Checkbox from 'material-ui/Checkbox'
import { observer } from "mobx-react"
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover'
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

@observer
class AddColumnComponent extends React.Component {
	constructor(){
		super()
	}

	componentWillMount(){
		this.setInitialState()
	}

	setDataType(e){
		this.state.uniqueCheck = configObject.dataTypes.filter(x => x.name == e.target.value)[0].unique	
		this.state['dataType'] = e.target.value
		this.setState(this.state)
		this.state.defaultValue = ''
		this.setState(this.state)
	}

	buildColumn(e){
		e.preventDefault();
		try{
			if(!this.state.dataType) 
				this.state.dataType = 'Text'
			let column = new CB.Column(this.state.name)
			column.required = this.state.required
			column.dataType = this.state.dataType

			if(this.state.defaultValue){
				if(this.state.dataType === "Number"){
					column.defaultValue = parseInt(this.state.defaultValue)
				} else if(this.state.dataType === "Boolean"){
					column.defaultValue = this.state.defaultValue == "true"
				} else column.defaultValue = this.state.defaultValue
			}

			if(this.state.dataType == 'Relation'){
				column.relatedTo = this.state.target
			}
			else if(this.state.dataType == 'List'){
				if(this.props.tableStore.getTables.filter(x => x.name == this.state.target).length){
					column.relatedTo = this.state.target
				}
				else {
					column.relatedTo = this.state.target
					column.listDataType = this.state.target
				}
			}
			else {
				if(this.state.uniqueCheck)
					column.unique = this.state.unique
			}
			this.props.tableStore.showTopLoader()
			this.props.tableStore.addColumn(column)
			this.setInitialState()
		}
		catch(e){
			console.log(e)
			this.props.tableStore.showSnackbar("Error adding column ,Please try again")
		}
	}

	handleTouchTap(event){
		// This prevents ghost click.
		event.preventDefault();
		this.setState({
		  open: true,
		  anchorEl: event.currentTarget
		})
	}

	handleRequestClose(){
		this.setState({
		  open: false
		})
		this.setInitialState()
	}

	checkHandler(which,e,data){
		this.state[which] = data
		this.setState(this.state)
	}

	changeHandler(which,e){
		this.state[which] = e.target.value
		this.setState(this.state)
	}

	toggleState(e){
		event.preventDefault();
		this.state.showAdvanceOptions = !this.state.showAdvanceOptions;
		this.setState(this.state)
	}

	setInitialState(){
		this.state = {
			open: false,
			name:'',
			dataType:'Text',
			uniqueCheck:false,
			target:'',
			unique:false,
			defaultValue: '',
			required:false,
			showAdvanceOptions: false,
			dateOpen:false,
			timeOpen:false,
			initialDateTime: (new Date()).toISOString()
		}
		this.setState(this.state)
	}
	
	dateFormat(date){
		if(date)
			return new Date(date).toISOString().slice(0,10).replace(/-/g,"/") + ", " + new Date(date).getHours()+":"+new Date(date).getMinutes()
	}

	viewChangeDate(e,data){
		let date = new Date(this.state.initialDateTime)
		date.setDate(data.getDate())
		date.setFullYear(data.getFullYear())
		date.setMonth(data.getMonth())
		this.state.defaultValue = date.toISOString()
		this.state.initialDateTime = date.toISOString()
		this.state.timeOpen = false
		this.state.dateOpen = false
		this.setState(this.state)
	}

	viewChangeTime(e,data){
		let date = new Date(this.state.initialDateTime)
		date.setHours(data.getHours())
		date.setMinutes(data.getMinutes())
		date.setSeconds(data.getSeconds())
		this.state.defaultValue = date.toISOString()
		this.state.initialDateTime = date.toISOString()
		this.state.timeOpen = false
		this.state.dateOpen = false
		this.setState(this.state)
	}

	// Check if setting Default Value is Allowed on the selected dataType
	defaultValueIsAllowed(dataType) {
		const allowedDataTypes = ['Text', 'Number', 'Boolean', 'DateTime', 'EncryptedText', 'URL', 'Email'];
		if(allowedDataTypes.indexOf(dataType) > -1){
			return true;
		}
		return false;
	}
	
	// Check if setting Target Type is Allowed on the selected dataType
	TargetTypeIsAllowed(dataType) {
		const allowedDataTypes = ['List', 'Relation'];
		if(allowedDataTypes.indexOf(dataType) > -1){
			return true;
		}
		return false;
	}
	
	// return type for <input> field accoring to the selected dataType 
	selectType(dataType) {
		if(dataType == "DateTime"){
			return "datetime-local"
		}
		const allowedDataTypes = ['Text', 'Number', 'URL', 'Email'];
		if(allowedDataTypes.indexOf(dataType) > -1){
			return dataType;
		}
		return "text";
	}

	// Open Date/Time Selection Dialog box to set Default Value for DateTime Type column
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

	render() {
		let { dataTypes } = configObject
		let date = ''
		let time = ''

		let columnTypes = dataTypes
		.filter( x => ['ACL','Id'].indexOf(x.name) == -1 )
		.reduce((dataTypeObject,x,i)=>{
			if(['List','Relation'].indexOf(x.name) === -1){
				dataTypeObject.basic.push(<option key={ i } value={ x.name }>{ x.text }</option>) 
			} else {
				dataTypeObject.advance.push(<option key={ i } value={ x.name }>{ x.text }</option>)
			}
			return dataTypeObject
		},{basic:[],advance:[]})

		let targetTypesData = []
		let targetTypesTable = []

		targetTypesData = configObject.dataTypes.filter(x => ['ACL','Id','List'].indexOf(x.name) == -1 ).map((x,i)=>{
			return <option key={ i } value={ x.name }>{ x.name }</option>
		})

		targetTypesTable = this.props.tableStore.getTables.map((x,i)=>{
			return <option key={ i } value={ x.name }>{ x.name }</option>
		})

		if(this.state.dateOpen){
			date = <DatePicker id="date" ref="InputDate" className='width0' dialogContainerStyle={{ zIndex: '400000' }} onChange={this.viewChangeDate.bind(this)}/>
		}
		if(this.state.timeOpen){
			time = <TimePicker id="time" ref="InputTime" className='width0' dialogStyle={{ zIndex: '400000' }} onChange={this.viewChangeTime.bind(this)}/>
		}

		return (
	           	<th className='tacenter pb7 tdtrcheck addcolthbtn' onTouchTap={this.handleTouchTap.bind(this)}>
	           		<i className="fa fa-plus addcolumns" aria-hidden="true"></i>
	           		<Popover
			          open={this.state.open}
			          anchorEl={this.state.anchorEl}
			          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
			          targetOrigin={{horizontal: 'left', vertical: 'top'}}
			          onRequestClose={this.handleRequestClose.bind(this)}
			          animation={PopoverAnimationVertical}
			          className="popupaddcolumns"
			        >
			        <form onSubmit={this.buildColumn.bind(this)}>
				        <div className="addcoldiv">
							<div>
								<p className="paddcolumns"> Column Type: </p>
								<select required className="addcolselect" value={ this.state.dataType || 'Text' } onChange={ this.setDataType.bind(this) }>
									<optgroup label="Basic">
										{ columnTypes.basic }
									</optgroup>
									<optgroup label="Advanced">
										{ columnTypes.advance }
									</optgroup>
								</select>
							</div>

							<div className={ this.TargetTypeIsAllowed(this.state.dataType) ? '' : 'hide'}>
								<p className="paddcolumns"> Target Type: </p>
								<select className="addcolselect" value={ this.state.target } onChange={ this.changeHandler.bind(this,'target') }>
									<option value=''>-select-</option>
									<optgroup label="DataTypes" className={ this.state.dataType ? ( this.state.dataType == 'List' ? "" : 'hide' ) : "hide"}>
										{ targetTypesData }
									</optgroup>
									<optgroup label="Tables">
										{ targetTypesTable }
									</optgroup>
								</select>
							</div>

							<div>
								<p className="paddcolumns"> Column Name:</p>
								<input className="addcolinput" placeholder="Column name." type="text" value={ this.state.name } onChange={ this.changeHandler.bind(this,'name') } pattern="^[^<>'\/;`%@]*$" required/>
				        	</div>

							<div className={this.defaultValueIsAllowed(this.state.dataType) ? 'paddcolumns' : 'hide'}>
								<a id="advanceOption" className={"cp advanceoptionaddcolum"} onClick={this.toggleState.bind(this)}>{ this.state.showAdvanceOptions ? "Hide Options" : "Advance Options" }</a>
							</div>
							<div id="defaultValue" className={ (this.state.showAdvanceOptions && this.defaultValueIsAllowed(this.state.dataType)) ? '' : 'hide'}>
								<p className='paddcolumns'> Default Value: </p>
								<input className={ this.state.dataType === "Boolean" || this.state.dataType === "DateTime" ? "hide" : "addcolinput" } type={this.selectType(this.state.dataType)} value={ this.state.defaultValue } onChange={ this.changeHandler.bind(this,'defaultValue') }/>
								<div className={ this.state.dataType == "Boolean" ? "paddcolumns" : "hide" }>
									&nbsp;&nbsp;<input type="radio" name="defaultValue" value="true" onClick={ this.changeHandler.bind(this,'defaultValue') }/> <span style={{fontWeight: 500}}>True</span> &nbsp;&nbsp;
									<input type="radio" name="defaultValue" value="false" onClick={ this.changeHandler.bind(this,'defaultValue') }/> <span style={{fontWeight: 500}}>False</span>
								</div>
								<div className={ this.state.dataType == "DateTime" ? "addcolinput" : "hide" } style={{backgroundColor: "white"}}>
									<span className={''}>{ (this.state.dataType == "DateTime" && this.state.defaultValue) ? this.dateFormat(this.state.defaultValue) : "" }</span>
									<i className="fa fa-calendar fr mtl2 cp" aria-hidden="true" onClick={this.openInput.bind(this,'InputDate')}></i>
									<i className="fa fa-clock-o fr mtl2 cp" aria-hidden="true" onClick={this.openInput.bind(this,'InputTime')}></i>
									{ date }
									{ time }
								</div>
							</div>

							<div>
								<p className="paddcolumnsfl"> Required </p>
								<Checkbox className='checkStyleaddcolfl' onCheck={this.checkHandler.bind(this,'required')} checked={this.state.required}/>
				        	</div>

							<div>
								<p className={ this.state.uniqueCheck ? 'paddcolumnsfr' : 'hide'}> Unique </p>
								<Checkbox className={ this.state.uniqueCheck ? 'checkStyleaddcolfr' : 'hide' } onCheck={this.checkHandler.bind(this,'unique')} checked={this.state.unique}/>
							</div>
						</div>
				        <button className="fl addcol" type="submit">Add</button>
			        </form>
			    	</Popover>
	           	</th>
		);
	}
}

export default AddColumnComponent;