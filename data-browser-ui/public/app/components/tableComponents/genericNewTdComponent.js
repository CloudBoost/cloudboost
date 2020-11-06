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


class GenericNewTd extends React.Component {
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
	generaliseComponent(props){
		switch (props.columnType.dataType) {
			case "Text":
				this.state.componentToRender =  TextTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "Number":
				this.state.componentToRender =  NumberTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "URL":
				this.state.componentToRender =  URLTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "Boolean":
				this.state.componentToRender =  BooleanTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "Email":
				this.state.componentToRender =  EmailTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "Id":
				this.state.componentToRender =  IdTd
				this.state.elementData = props.columnData.document['_id']
				break;

			case "EncryptedText":
				this.state.componentToRender =  PasswordTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "DateTime":
				this.state.componentToRender =  DateTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "Object":
				this.state.componentToRender =  ObjectTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "GeoPoint":
				this.state.componentToRender =  GeoTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "File":
				this.state.componentToRender =  FileTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "List":
				this.state.componentToRender =  ListTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "Relation":
				this.state.componentToRender =  RelationTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;

			case "ACL":
				this.state.componentToRender =  ACLTd
				this.state.elementData = props.columnData.document[props.columnType.name]
				break;
			
			default:
				this.state.componentToRender =  TextTd
				this.state.elementData = "a"
				break;
		}
		if(this.state.elementData == undefined && props.columnType.required == true){
			this.state.isRequired = true
		}
		this.state.elementDataBackup = this.state.elementData
		this.setState(this.state)
	}
	updateObject(){
		if(this.state.elementData && this.props.columnType.required == true){
			this.state.isRequired = false
		}
		this.props.columnData.set(this.props.columnType.name,this.state.elementData)
		this.props.columnData.save().then((res)=>{
			this.state.elementDataBackup = res.document[this.props.columnType.name]
			this.setState(this.state)
			this.props.setError(false)
		},(err)=>{
			console.log(err)
			this.props.setError(err)
			//this.fetchObject()
		})
	}
	fetchObject(){
		this.state.elementData = this.state.elementDataBackup
		this.setState(this.state)
	}
	updateElement(data){
		this.state.elementData = data
		this.setState(this.state)
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
		       	isRequired:this.state.isRequired
           })
		);
	}
}

export default GenericNewTd;