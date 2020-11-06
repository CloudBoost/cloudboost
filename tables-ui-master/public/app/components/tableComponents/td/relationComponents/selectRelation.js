import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';

class SelectRelation extends React.Component {
	constructor(){
		super()
		this.state = {
			isModalOpen:false,
			tableData:[]
		}
	}
	componentDidMount(){
		let query = new CB.CloudQuery(this.props.table)
		query.find().then((list)=>{

			this.modifyTableData(list,(newList) => {
				this.setState({tableData:newList})
			})
			
		})
	}
	selectRelation(relationObject){
		this.props.updateElement(relationObject)
		this.props.updateObject()
		this.openCloseModal(false)
	}
	openCloseModal(){
		this.props.openCloseModal(false,'isOpenSelect')
	}
	search(which,e){
		let query = new CB.CloudQuery(this.props.table)
		if (e.target.value) query.search(e.target.value)
		query.find().then((list)=>{
			if(list.length){
				this.modifyTableData(list,(newList) => {
					this.setState({tableData:newList})
				})
			}
		})
	}
    dateFormat(date){
    	if(date) return new Date(date).toISOString().slice(0,10).replace(/-/g,"/") + ", " + new Date(date).getHours()+":"+new Date(date).getMinutes()
    		else return null
	}
	handleClose(){
		this.openCloseModal(false)
	}

	modifyTableData(tableData,cb){
		
		let newList = tableData.map((cloudObject,i) => {
			return new Promise((resolve,reject) => {
				let imageFound = false
				let headingStr = ''
				let otherData = [{
					name : 'Last Modified:',
					value: this.dateFormat(cloudObject.updatedAt)
				}]

				if(cloudObject.document){
					let obj = cloudObject.document
					
					for(var k in obj){
						// skipping all data which is not required
						if(k[0] == '_') continue;
						if(['createdAt','updatedAt','ACL','expires'].indexOf(k) > -1) continue;


						if(typeof obj[k] === 'string' && !headingStr){
							headingStr = k + ' : ' + obj[k].slice(0,20); continue;
						}
						if(typeof obj[k] === 'string' && otherData.length < 5){
							otherData.push({ name:k, value:obj[k].slice(0,20) }); continue;
						}
						if(typeof obj[k] === 'object' && !imageFound && obj[k]){
							if(obj[k].document){
								if(obj[k].document._type === 'file'){
									imageFound = true
									obj[k].fetch({
										success: function (file) {
											let url = file.url || 'https://play.google.com/about/img/icons/restricted.png'
											resolve({
												originalObject : cloudObject,
												headingStr,
												otherData,
												imageFound:url
											})
										}.bind(this), error: function (err) {
											resolve({
												originalObject : cloudObject,
												headingStr,
												otherData,
												imageFound:'https://play.google.com/about/img/icons/restricted.png'
											})
										}
									});
								} else continue;
							} else continue;
						}
					}
					if(!imageFound){
						resolve({
							originalObject : cloudObject,
							headingStr,
							otherData,
							imageFound
						})
					}

				} else {
					resolve({
						originalObject : cloudObject,
						headingStr,
						otherData,
						imageFound
					})
				}
			})
		})

		Promise.all(newList).then((data)=>{
			cb(data)
		},(err)=>{
			cb(tableData.map((x,i)=>{
				return {
						originalObject : x,
						headingStr:'',
						otherData:[],
						imageFound:false
					}
			}))
		})

	}
	render() {
		let tableData = []
		if(this.state.tableData.length){
			tableData = this.state.tableData
			.map((cloudObject,i) => {

				return 	<div className="tabledatadiv cp" key={ i } onClick={ this.selectRelation.bind(this,cloudObject.originalObject) }>

							<div className="leftrelselectordata">
								<span className="mainheadingrelselector">{ cloudObject.headingStr || 'undefined' }</span>
								<span className="secondheadingrealtionselector">ID : { cloudObject.originalObject.id }</span>

								{
									cloudObject.otherData.map((x,index)=>{
										return 	<div className="relationselectorcolcont" key={ index }>
													<span className="headreleationselectorcol">{ x.name }</span>
													<span className="datareleationselectorcol">{ x.value ? x.value : 'undefined' }</span>
												</div>
									})
								}
								
							</div>
							<div className="rightrelselectordata">
								{
									cloudObject.imageFound ? <img className="relationselectorimage" src={ cloudObject.imageFound }/> : ''
								}
							</div>
							
						</div>
			})
		}
		let dialogTitle = <div className="modaltitle" style={{display:'none'}}>
							<span className="diadlogTitleText">Select a Relation Object</span>
							<span className="diadlogTitleTextSub">You can select a row from the related table.</span>
							<i className='fa fa-lock iconmodal'></i>
						</div>
		return (
			<div className="fr">
	            
	        	<Dialog title={dialogTitle} modal={false} open={this.props.open} onRequestClose={this.handleClose.bind(this)} overlayClassName="relpickeroverlay" contentClassName="relpickercontent" bodyClassName="relpickerbody" style={{zIndex:3000}}>

					<div className="selectormodalparent">	
						<div className="relationselectordiv">
							<i className="fa fa-search relsearchicon" aria-hidden="true"></i>
							<input className="relationsearchinput" placeholder="Search For Records .." onChange={ this.search.bind(this,'search') }/>
							{ tableData }
						</div>
					</div>

	    		</Dialog>
    		</div>
		);
	}
}

export default SelectRelation;