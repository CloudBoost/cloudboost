import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

class GeoPoint extends React.Component {
	constructor(){
		super()
		this.state = {
			isModalOpen:false
		}
	}
	componentDidMount(){
	}
	openCloseModal(what){
		this.state.isModalOpen = what
		this.setState(this.state)
	}
	changeHandler(which,e){
		let location
		if(which == 'longitude'){
			if(this.props.elementData){
				location = new CB.CloudGeoPoint(e.target.value,( this.props.elementData.document.latitude || 0));
			} else {
				location = new CB.CloudGeoPoint(e.target.value,0);
			}
		} else {
			if(this.props.elementData){
				location = new CB.CloudGeoPoint((this.props.elementData.document.longitude || 0),e.target.value);
			} else {
				location = new CB.CloudGeoPoint(0,e.target.value);
			}
		}
		this.props.updateElementData(location,this.props.columnData.name)
    }
    cancelGeoUpdate(){
		this.openCloseModal(false)
	}
	handleClose(){
		
	}
	render() {
		let data = {}
		data.lat = this.props.elementData ? (this.props.elementData.latitude || 0) : 0
		data.long = this.props.elementData ? (this.props.elementData.longitude || 0) : 0
		return (
            <div className="halfreldiv ">
            	<span className="textnamerlation"> { this.props.columnData.name } </span>
            	<span className="color888 spanrelcustom">{ JSON.stringify(data) }</span>
            	<i className="fa fa-expand fr filerle cp" aria-hidden="true" onClick={this.openCloseModal.bind(this,true)}></i>
            	<Dialog title="Geo Location EDITOR" modal={false} open={this.state.isModalOpen} onRequestClose={this.handleClose.bind(this)} titleClassName="modaltitle">
	          		<TextField
				      hintText="Latitude"
				      floatingLabelText="Enter a Latitude"
				      value={
				      	this.props.elementData ? (this.props.elementData.document.latitude || '') : ''
				      }
				      onChange={this.changeHandler.bind(this,'latitude')}
				      type="number"
				    />
				    <TextField
				      hintText="Longitude"
				      floatingLabelText="Enter a Longitude"
				      value={
				      	this.props.elementData ? (this.props.elementData.document.longitude || '') : ''
				      }
				      onChange={this.changeHandler.bind(this,'longitude')}
				      type="number"
				    />
	          		<button className="btn btn-danger fr" onClick={this.cancelGeoUpdate.bind(this)}>Done</button>
        		</Dialog>
            </div>
		);
	}
}

export default GeoPoint;