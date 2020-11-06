import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';
import Badge from 'material-ui/Badge';
import { Popover } from 'material-ui/Popover'

import TextList from './listComponents/textList.js'
import EmailList from './listComponents/emailList.js'
import BooleanList from './listComponents/booleanList.js'
import PasswordList from './listComponents/passwordList.js'
import ObjectList from './listComponents/objectList.js'
import GeoList from './listComponents/geoList.js'
import FileList from './listComponents/fileList.js'
import NumberList from './listComponents/numberList.js'
import DateTimeList from './listComponents/dateTimeList.js'
import RelationList from './listComponents/relationList.js'
import GenericAddToList from './listComponents/genericAddToList.js'

class ListTdComponent extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			isModalOpen:false,
			elementData:[],
			elementToRender:TextList
		}
	}
	componentDidMount(){
		this.generaliseList(this.props)
	}
	componentWillReceiveProps(props){
		this.generaliseList(props)
	}
	generaliseList(props){
		switch (props.columnType.relatedTo) {
			case "Text":
				this.state.elementToRender =  TextList
				break;
			case "EncryptedText":
				this.state.elementToRender =  PasswordList
				break;
			case "Boolean":
				this.state.elementToRender =  BooleanList
				break;
			case "Email":
				this.state.elementToRender =  EmailList
				break;
			case "URL":
				this.state.elementToRender =  TextList
				break;
			case "Url":
				this.state.elementToRender =  TextList
				break;
			case "DateTime":
				this.state.elementToRender =  DateTimeList
				break;
			case "File":
				this.state.elementToRender =  FileList
				break;
			case "Object":
				this.state.elementToRender =  ObjectList
				break;
			case "Number":
				this.state.elementToRender =  NumberList
				break;
			case "GeoPoint":
				this.state.elementToRender =  GeoList
				break;
			default:
				this.state.elementToRender =  RelationList
				break;
		}
		this.state.elementData = props.elementData
		this.setState(this.state)
	}
	openCloseModal(what,save,event){
		this.state.anchorEl = event.currentTarget
		if(save){
			this.props.updateElement(this.state.elementData)
			this.props.updateObject()			
		} else {
			this.props.fetchObject()
		}
		this.state.isModalOpen = what
		this.setState(this.state)
	}
	updateElementData(data,index){
		this.state.elementData[index] = data
		this.setState(this.state)
	}
	addToElementData(data){

		if(!this.state.elementData){
			this.state.elementData = []
		}
		// if data is not provided then compute it here
		if(data === false){
			// check type of related to , and add elemnt accordingly
			let type = this.props.columnType.relatedTo
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
	}
	removeFromElementData(index){
		this.state.elementData.splice(index,1)
		this.setState(this.state)
	}
	changeHandler(value,e){
    	this.props.updateElement(value)
    }
	render() {
		let requiredClass = this.props.isRequired ? " requiredred":""
		let elements = []
		// For file images perview ,other data types will show a badge with a list counter
		let filePreviewImages = []
		// For text.number,email,boolean perview ,other data types will show a badge with a list counter
		let textPreview = []

		if(this.state.elementData && this.state.elementData.constructor === Array){
			elements = this.state.elementData.map((data,index)=>{
				return React.createElement(this.state.elementToRender, {
							index:index,
					       	key:index,
					       	data:data,
					       	addToElementData:this.addToElementData.bind(this),
					       	removeFromElementData:this.removeFromElementData.bind(this),
					       	updateElementData:this.updateElementData.bind(this),
					       	columnType:this.props.columnType.relatedTo,
							isListOfRelation:false
			           })
			})

			// build file prview only if data type is file and files exist
			if(this.props.columnType.relatedTo === 'File' && this.state.elementData.length){
				filePreviewImages = this.state.elementData.map((file,index)=>{
					// max three files to be shown
					if(index < 3) return <img key={ index } className={'previewlistimages'} src={'public/app/assets/images/file/file.png'} />
				})
			}

			// build prview if data type is text.number,email
			if(['Text','Number','Email'].indexOf(this.props.columnType.relatedTo) > -1 && this.state.elementData.length){
				textPreview = this.state.elementData.map((elem,index)=>{
					// max two files to be shown
					if(index < 2) return <div key={ index }className={'previewlisttext'}>{ elem.toString().substring(0,3) }..</div>
				})
			}
			// build prview if data type is boolean
			if(['Boolean'].indexOf(this.props.columnType.relatedTo) > -1 && this.state.elementData.length){
				textPreview = this.state.elementData.map((elem,index)=>{
					// max two files to be shown
					if(index < 2) return <div key={ index }className={'previewlisttext'}>{ elem ? 'true' : 'false' }</div>
				})
			}
		}
		let dialogTitle = <div className="modaltitle">
							<span className="diadlogTitleText">List Editor</span>
							<i className='fa fa-bars iconmodal'></i>
						</div>
		return (
            <td className={'mdl-data-table__cell--non-numeric pointer'+requiredClass} onDoubleClick={this.openCloseModal.bind(this,true,false)}>
				<span className="color888 expandleftpspan">
					<Badge
						badgeContent={ this.state.elementData ? this.state.elementData.length : 0 }
						primary={ this.state.elementData ? !!this.state.elementData.length : false }
						className={ 'badgelistcount' }
					></Badge>
					{ 
						filePreviewImages.length ? 
							<span className="entriesbadgeright">  { filePreviewImages } </span> 
							:
							(
								textPreview.length ?
									<span className="entriesbadgeright">  { textPreview } </span>
									: 
									<span className="entriesbadgeright"> - Entries </span> 
							)
					}
				</span>

            	<i className="fa fa-expand fr expandCircle" aria-hidden="true" onClick={this.openCloseModal.bind(this,true,false)}></i>
				{ 	this.props.columnType.relatedTo === 'File' ?
						<Popover
							open={this.state.isModalOpen}
							anchorEl={this.state.anchorEl}
							anchorOrigin={{ "horizontal":"left","vertical":"bottom" }}
							targetOrigin={{ "horizontal":"right","vertical":"top" }}
							onRequestClose={this.openCloseModal.bind(this,false,true)}
							animated={false}
							className="listpop"
						>
							<div>
								<div className="listdivscontentfilepop">
									{ elements }
								</div>

								<GenericAddToList
									addToElementData={ this.addToElementData.bind(this) }
									columnType={ this.props.columnType.relatedTo }
								/>
							</div>
						</Popover>
					:
						<Popover
							open={this.state.isModalOpen}
							anchorEl={this.state.anchorEl}
							anchorOrigin={{ "horizontal":"left","vertical":"bottom" }}
							targetOrigin={{ "horizontal":"right","vertical":"top" }}
							onRequestClose={this.openCloseModal.bind(this,false,true)}
							animated={false}
							className="listother"
						>
							<div>
								<div className="listdivscontent">
									{ 
										elements.length ? elements : <p className="emptylisttext">This list is empty.</p>
									}
								</div>

								<GenericAddToList
									addToElementData={ this.addToElementData.bind(this) }
									columnType={ this.props.columnType.relatedTo }
								/>
							</div>
						</Popover>					
				}
            </td>
		);
	}
}

export default ListTdComponent;