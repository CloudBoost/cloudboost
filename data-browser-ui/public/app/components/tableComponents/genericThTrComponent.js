import React from 'react';
import { observer } from "mobx-react"
import Checkbox from '../checkbox'
import AddColumnComponent from './addColumnComponent'
import configObject from '../../config/app.js'
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover'
import ColumnOptions from './columnOptionsComponent.js'

@observer
class GenericTh extends React.Component {
	constructor(){
		super()
		this.state = {
			open: false,
			columnData:''
		}
	}
	componentWillMount(){

	}
	handleTouchTap(columnData,event){
		// This prevents ghost click.
		event.preventDefault();
		this.state.columnData = columnData
		this.state.open = true
		this.state.anchorEl = event.currentTarget
		this.setState(this.state)
	}
	handleRequestClose(){
		this.setState({
		  open: false
		})
	}
	changeHandler(which,e){
		this.state[which] = e.target.value
		this.setState(this.state)
	}
	render() {

		let { getColumns,hiddenColumns } = this.props.tableStore

		let columnsHeadings = getColumns.map((x,index) => {
			let icon = configObject.dataTypes.filter(y => y.name == x.dataType)[0];
			let IconElem = <i className={ icon.icon + ' colicon'}></i>
			let smallIconElem
			if(icon.name == "Object"){
				IconElem = <img style={{width:20,height:17,marginRight:5,marginBottom:3}} src="public/app/assets/images/javascript.png" />
			}
			if(x.relatedTo && x.dataType == 'List'){
				let iconClass = configObject.dataTypes.filter(y => y.name == x.relatedTo)
				iconClass = iconClass[0] ? iconClass[0].icon : 'fa fa-external-link'
				smallIconElem = <i className={ iconClass + ' smallcolicon'}></i>
			} else smallIconElem = ""
			let hidden = hiddenColumns.indexOf(x.name) != -1
			return <th key={index} className={ hidden ? 'hide':'taleft pb7'}>
						{ IconElem }
						{ smallIconElem }
						<span className="colname"> { x.name.slice(0,15) } </span>
						<i className='fr ion-arrow-down-b cp' onTouchTap={this.handleTouchTap.bind(this,x)}></i>
					</th>
		})


		return (
				<tr>
					<th className="tdtrcheck">
						<Checkbox className="mlm11" onCheck={ this.props.selectDeselectAllRows }/>
						<Popover
				          open={this.state.open}
				          anchorEl={this.state.anchorEl}
				          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
				          targetOrigin={{horizontal: 'left', vertical: 'top'}}
				          onRequestClose={this.handleRequestClose.bind(this)}
				          animated={false}
				          className="columnpop"
				        >
				        	<ColumnOptions tableStore={ this.props.tableStore } columnData={ this.state.columnData } handleRequestClose={ this.handleRequestClose.bind(this) }/>
				        </Popover>
					</th>
						{ columnsHeadings }
					<AddColumnComponent tableStore={ this.props.tableStore } />
					<th className='tacenter pb7 tdtrcheck hiddencolbtn'>
					</th>
				</tr>
		);
	}
}

export default GenericTh;
