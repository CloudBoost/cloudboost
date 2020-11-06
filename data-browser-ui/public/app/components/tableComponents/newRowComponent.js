import React from 'react';
import { observer } from "mobx-react"
//components
import GenericNewTd from './genericNewTdComponent'
import RowErrorComponent from './rowErrorComponents'

@observer
class NewRow extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			error:this.props.rowObject.error
		}
	}
	componentWillMount(){
		
	}
	setError(error){
		if(error){
			this.state.error = error
			this.setState(this.state)
		} else {
			this.props.tableStore.setColumnsData()
		}
	}
	changeHandler(which,e){
		this.state[which] = e.target.value
		this.setState(this.state)
	}
	render() {

		let { getColumns,hiddenColumns } = this.props.tableStore
		return (
			<tr> 
				{/* TODO: Clean the logic here */}
				{ this.props.overlap ?
					<RowErrorComponent rowObject={ this.props.rowObject } tableStore={ this.props.tableStore } error={ this.state.error }/>
					:
					<td className="tdtrcheck">
           				
           			</td>
				}
				{ 	
					this.props.overlap ?
						getColumns
						.filter(x => x.dataType == "Id")
						.map((x,index) => {
							return <GenericNewTd key={index} columnType={ x } columnData={ this.props.rowObject } tableStore={ this.props.tableStore } setError={ this.setError.bind(this) }></GenericNewTd> 
						})
						:
						getColumns
						.filter(x => hiddenColumns.indexOf(x.name) == -1)
						.map((x,index) => {
							return <GenericNewTd key={index} columnType={ x } columnData={ this.props.rowObject } tableStore={ this.props.tableStore } setError={ this.setError.bind(this) }></GenericNewTd> 
						})
				} 
			</tr>
		);
	}
}

export default NewRow;