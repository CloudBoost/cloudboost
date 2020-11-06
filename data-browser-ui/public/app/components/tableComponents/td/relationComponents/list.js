import React from 'react';
import ReactDOM from 'react-dom';

import TextList from '../listComponents/textList.js'
import BooleanList from '../listComponents/booleanList.js'
import PasswordList from '../listComponents/passwordList.js'
import ObjectList from '../listComponents/objectList.js'
import GeoList from '../listComponents/geoList.js'
import FileList from '../listComponents/fileList.js'
import NumberList from '../listComponents/numberList.js'
import DateTimeList from '../listComponents/dateTimeList.js'
import RelationList from '../listComponents/relationList.js'
import GenericAddToList from '../listComponents/genericAddToList.js'

class ListTdComponent extends React.Component {
	constructor() {
		super()
		this.state = {
			elementData: [],
			elementToRender: TextList
		}
	}
	componentDidMount() {
		this.generaliseList(this.props)
	}
	componentWillReceiveProps(props) {
		this.generaliseList(props)
	}
	generaliseList(props) {
		switch (props.columnData.relatedTo) {
			case "Text":
				this.state.elementToRender = TextList
				break;
			case "EncryptedText":
				this.state.elementToRender = PasswordList
				break;
			case "Boolean":
				this.state.elementToRender = BooleanList
				break;
			case "Email":
				this.state.elementToRender = TextList
				break;
			case "URL":
				this.state.elementToRender = TextList
				break;
			case "Url":
				this.state.elementToRender = TextList
				break;
			case "DateTime":
				this.state.elementToRender = DateTimeList
				break;
			case "File":
				this.state.elementToRender = FileList
				break;
			case "Object":
				this.state.elementToRender = ObjectList
				break;
			case "Number":
				this.state.elementToRender = NumberList
				break;
			case "GeoPoint":
				this.state.elementToRender = GeoList
				break;
			default:
				this.state.elementToRender = RelationList
				break;
		}
		this.state.elementData = props.elementData
		this.setState(this.state)
	}
	updateElementData(data, index) {
		this.state.elementData[index] = data
		this.setState(this.state)
		this.props.updateElementData(this.state.elementData, this.props.columnData.name)
	}
	addToElementData(data) {
		if(!this.state.elementData){
			this.state.elementData = []
		}
		// if data is not provided then compute it here
		if(data === false){
			// check type of related to , and add elemnt accordingly
			let type = this.props.columnData.relatedTo
			if(type == 'Number'){
				data = 0
			} else if(type == 'DateTime'){
				data = new Date()
			} else if(type == 'GeoPoint'){
				data = new CB.CloudGeoPoint(0,0)
			} else if(type == 'Boolean'){
				data = false
			} else {
				data = ''
			}
		}
		// push the empty data into elementData
		this.state.elementData.push(data)
		this.setState(this.state)
		this.props.updateElementData(this.state.elementData, this.props.columnData.name)
	}
	removeFromElementData(index) {
		this.state.elementData.splice(index, 1)
		this.setState(this.state)
		this.props.updateElementData(this.state.elementData, this.props.columnData.name)
	}
	handleClose() {

	}
	render() {
		let elements = []
		if (this.state.elementData) {
			elements = this.state.elementData.map((data, index) => {
				return React.createElement(this.state.elementToRender, {
					index: index,
					key: index,
					data: data,
					addToElementData: this.addToElementData.bind(this),
					removeFromElementData: this.removeFromElementData.bind(this),
					updateElementData: this.updateElementData.bind(this),
					isListOfRelation: true
				})
			})
		}
		return (
			<div className="listrelationdiv">
				<span className="textnamerlationrle"> {this.props.columnData.name} </span>
				<div className="listdivrel">
					<GenericAddToList
						addToElementData={this.addToElementData.bind(this)}
						columnType={this.props.columnData.relatedTo}
					/>
					<div className="listdivscontentrelation">
					{
						// if no elementData are found then show empty list( only for non file data types )
						elements.length || this.props.columnData.relatedTo === 'File' ? elements : <p className="emptylisttext">This list is empty.</p>
					}
					</div>

				</div>
			</div>
		);
	}
}

export default ListTdComponent;