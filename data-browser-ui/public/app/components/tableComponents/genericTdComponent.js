import React from 'react';
import ReactDOM from 'react-dom';
import configObject from '../../config/app.js'

//components
import TextTd from './td/textTdComponent'
import NumberTd from './td/numberTdComponent'
import URLTd from './td/urlTdComponent'
import BooleanTd from './td/booleanTdComponent'
import DateTd from './td/dateTdComponent'
import IdTd from './td/idTdComponent'
import PasswordTd from './td/passwordTdComponent'
import EmailTd from './td/emailTdComponent'
import ObjectTd from './td/objectTdComponent'
import GeoTd from './td/geoTdComponent'
import FileTd from './td/fileTdComponent'
import ListTd from './td/listTdComponent'
import RelationTd from './td/relationTdComponent'
import ACLTd from './td/aclTdComponent'


class GenericTdComponent extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			elementData:null,
			elementDataBackup:null,
			componentToRender:TextTd,
			isRequired:false
		}
	}
	componentDidMount(){
		this.generaliseComponent(this.props)
	}
	componentWillReceiveProps(props){
		this.generaliseComponent(props)
	}
	shouldComponentUpdate(props,state){
		//console.log(this.state.elementData != state.elementData)
		//console.log(this.props.columnData.version,props.columnData.version)
		//console.log(this.props.tableStore.hiddenColumns.length)
		//return this.state.elementData != state.elementData
		return true
	}
  
	generaliseComponent(props){
		let componentToRender
		let elementData
		switch (props.columnType.dataType) {
			case "Text":
				componentToRender =  TextTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "Number":
				componentToRender =  NumberTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "URL":
				componentToRender =  URLTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "Boolean":
				componentToRender =  BooleanTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "Email":
				componentToRender =  EmailTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "Id":
				componentToRender =  IdTd
				elementData = props.columnData.document['_id']
				break;

			case "EncryptedText":
				componentToRender =  PasswordTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "DateTime":
				componentToRender =  DateTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "Object":
				componentToRender =  ObjectTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "GeoPoint":
				componentToRender =  GeoTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "File":
				componentToRender =  FileTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "List":
				componentToRender =  ListTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "Relation":
				componentToRender =  RelationTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			case "ACL":
				componentToRender =  ACLTd
				elementData = props.columnData.document[props.columnType.name]
				break;

			default:
				componentToRender =  TextTd
				elementData = "a"
				break;
		}
		let elementDataBackup = elementData
		if(elementData == undefined && props.columnType.required == true){
			this.setState({
				elementDataBackup:elementDataBackup,
				elementData:elementData,
				componentToRender:componentToRender,
				isRequired:true
			})
		} else {
			this.setState({
				elementDataBackup:elementDataBackup,
				elementData:elementData,
				componentToRender:componentToRender,
				isRequired:false
			})
		}
	}
	updateObject () {
		if(this.state.elementData && this.props.columnType.required == true){
			this.state.isRequired = false
		}
		this.props.columnData.set(this.props.columnType.name,this.state.elementData)
		this.props.columnData.save().then((res)=>{
			this.setState({elementDataBackup:res.document[this.props.columnType.name]})
		},(err)=>{
			console.log(err)
			this.fetchObject()
			this.props.tableStore.showSnackbar("Error updating object. Please refresh and try again.")
		})
	}
	fetchObject(){
		this.setState({ elementData: this.state.elementDataBackup })
	}
	updateElement(elementData){
		this.setState({ elementData })
	}
	render() {
		return (
      React.createElement(this.state.componentToRender, {
        elementData:this.state.elementData,
        updateObject:this.updateObject.bind(this),
        updateElement:this.updateElement.bind(this),
        fetchObject:this.fetchObject.bind(this),
        columnName:this.props.columnType.name,
        columnData:this.props.columnData,
        columnType:this.props.columnType,
        openRowEntryModal: this.props.openRowEntryModal,
        isRequired:this.state.isRequired
      })
		);
	}
}

export default GenericTdComponent;
