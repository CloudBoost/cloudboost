import React from 'react'
import { observer } from "mobx-react"
import configObject from '../../config/app.js'

@observer
class FilterRow extends React.Component {
	constructor(){
		super()
		this.state = {

		}
	}
	componentWillMount(){

	}
	setDataType(e){
		let types = configObject.filterTypes.filter((x)=>{
			return x.type.indexOf(e.target.options[e.target.options.selectedIndex].getAttribute('type')) != -1
		})
		this.props.changeHandler('filterTypes',types[0].options,this.props.filterData.id)
		if(e.target.options[e.target.options.selectedIndex].getAttribute('data-relatedTo')){
			this.props.changeHandler('relatedTo',e.target.options[e.target.options.selectedIndex].getAttribute('data-relatedTo'),this.props.filterData.id)
			if(types[0].notContains.indexOf(e.target.options[e.target.options.selectedIndex].getAttribute('data-relatedTo')) != -1){
				this.props.changeHandler('filterTypes',types[0].optionsNotContains,this.props.filterData.id)
			} 
		}
		this.props.changeHandler('columnType',e.target.options[e.target.options.selectedIndex].getAttribute('type'),this.props.filterData.id)
		this.props.changeHandler('filterType','',this.props.filterData.id)
		this.props.changeHandler('dataType',e.target.value,this.props.filterData.id)
	}
	setType(e){
		this.props.changeHandler('selectedType',e.target.value,this.props.filterData.id)
	}
	setFilterType(e){
		this.props.changeHandler('filterType',e.target.value,this.props.filterData.id)
	}
	setDataValue(ischeckbox,e){
		let value = e.target.value
		if(ischeckbox) value = e.target.checked
		if(this.props.filterData.columnType === 'Number'){
			value = parseInt(value)
		}
		this.props.changeHandler('dataValue',value,this.props.filterData.id)
	}
	setListDataValue(e){
		let value = e.target.nextSibling.value
		if(value){
			this.props.changeHandler('listDataValue',value,this.props.filterData.id)
		}
		e.target.nextSibling.value = null
	}
	removeListDataValue(index){
		this.props.removeListDataValue(index,this.props.filterData.id)
	}
	getInputType(props){
		let inputType
		// if filtertype selected is exists or doesnotexists then return disabled input
		if(['exists','doesNotExists'].indexOf(props.filterData.filterType) !== -1){
			return <input type="text" className="inputfilter" disabled="true" style={{visibility:'hidden'}}/>
		}
		// if no filtertype selected then return disabled input
		if(!props.filterData.filterType){
			return <input type="text" className="inputfilter" disabled="true"/>
		}
		if(props.filterData.columnType){
			if(['Text','Email','URL','EncryptedText'].indexOf(props.filterData.columnType) != -1){
				inputType = <input type="text" className="inputfilter" value={ props.filterData.dataValue } onChange={ this.setDataValue.bind(this,false) }/>
			}
			else if(['Number'].indexOf(props.filterData.columnType) != -1){
				inputType = <input type="number" className="inputfilter" value={ props.filterData.dataValue } onChange={ this.setDataValue.bind(this,false) }/>
			} 
			else if(['DateTime'].indexOf(props.filterData.columnType) != -1){
				inputType = <input type="date" className="inputfilter" value={ props.filterData.dataValue } onChange={ this.setDataValue.bind(this,false) }/>
			} 
			else if(['Boolean'].indexOf(props.filterData.columnType) != -1){
				inputType = <input type="checkbox" className="inputfilter boolfilter" checked={ props.filterData.dataValue } onChange={ this.setDataValue.bind(this,true) }/>
			}
			else if(['List'].indexOf(props.filterData.columnType) != -1){
				inputType = this.getListInput(props)
			}
			else {
				inputType = <input type="text" className="inputfilter" disabled="true"/>
			}
		} else {
			inputType = <input type="text" className="inputfilter" disabled="true"/>
		}
		return inputType
	}
	getListInput(props){
		let inputType
		if(props.filterData.relatedTo){
			if(['Text','Email','URL','EncryptedText','Number'].indexOf(props.filterData.relatedTo) != -1){

				inputType = <div className="listfilterrows">
								<i className="fa fa-plus listfilteradd" aria-hidden="true" onClick={ this.setListDataValue.bind(this) }></i>
								<input type="text" className="inputfilterlist"/>
								{
									this.props.filterData.listDataValue.map((x,i)=>{
										return <div className="divadditionallist" key={ i }>
													<i className="fa fa-minus minuslist" aria-hidden="true" onClick={ this.removeListDataValue.bind(this,i) }></i>
													<input type="text" className="inputfilterlistValues" value={ x } disabled="true" />
												</div>
									})
								}
							</div>
			} 
			else if(['DateTime'].indexOf(props.filterData.relatedTo) != -1){
				inputType = <div className="listfilterrows">
								<i className="fa fa-plus listfilteradd" aria-hidden="true" onClick={ this.setListDataValue.bind(this) }></i>
								<input type="date" className="inputfilterlist"/>
								{
									this.props.filterData.listDataValue.map((x,i)=>{
										return <div className="divadditionallist" key={ i }>
													<i className="fa fa-minus minuslist" aria-hidden="true" onClick={ this.removeListDataValue.bind(this,i) }></i>
													<input type="date" className="inputfilterlistValues" value={ x } disabled="true" />
												</div>
									})
								}
							</div>
			}
			else {
				inputType = <input type="text" className="inputfilter" disabled="true" value={ props.filterData.dataValue } onChange={ this.setDataValue.bind(this,false) }/>
			}
		} else {
			inputType = <input type="text" className="inputfilter" disabled="true" value={ props.filterData.dataValue } onChange={ this.setDataValue.bind(this,false) }/>
		}
		return inputType
	}
	render() {

		let dataTypes = this.props.tableStore.getColumns
						.filter((x)=>{
							return !(x.dataType == 'Id' || x.dataType == 'ACL') 
						})
						.map((data,i)=>{
							if(data.dataType == 'List'){
								return <option key={ i } value={ data.name } type={ data.dataType } data-relatedTo={ data.relatedTo }>{ data.name }</option>
							} else {
								return <option key={ i } value={ data.name } type={ data.dataType }>{ data.name }</option>
							}
						})
		let type = this.props.filterData.type.map((x,i)=>{
			return <option key={ i } value={ x }>{ x }</option>
		})
		let filterTypes = this.props.filterData.filterTypes.map((data,i)=>{
			return <option key={ i } value={ data }>{ data }</option>
		})
		let inputType = this.getInputType(this.props)

		return (
          	<div className="filterrow">
	          	<select className="form-control selectfilter" value={ this.props.filterData.selectedType } onChange={ this.setType.bind(this) }>
	          		{ type }
	          	</select>
	          	<select className="form-control selectfilter" value={ this.props.filterData.dataType } onChange={ this.setDataType.bind(this) }>
	          		<option value=''>-select-</option>
	          		{ dataTypes }
	          	</select>
	          	<select className="form-control selectfilter" value={ this.props.filterData.filterType } onChange={ this.setFilterType.bind(this) }>
	          		{ filterTypes }
	          	</select>
	          	{ inputType }
	          	<i onClick={ this.props.deleteFilter.bind(this,this.props.filterData.id) } className="fa fa-close filterclose" aria-hidden="true"></i>
	        </div>
		);
	}
}

export default FilterRow