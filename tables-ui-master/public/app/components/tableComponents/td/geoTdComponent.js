import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

class GeoTdComponent extends React.Component {
	constructor(){
		super()
		this.state = {
			isModalOpen:false,
			errmsg:''
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
		try {
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
			this.setState({errmsg:""})
		} catch(e){
			this.setState({errmsg:"Please check the correspondind latitude and longitude values"})
		}
		this.props.updateElement(location)
    }
    GeoSave(){
		try {
        	this.props.updateObject()
        	this.openCloseModal(false)
	    } catch (e) {
	        this.cancelJsonUpdate(false)
	    }		
	}
    cancelGeoUpdate(){
		this.props.fetchObject()
		this.openCloseModal(false)
	}
	render() {
		let requiredClass = this.props.isRequired ? " requiredred":""
		let data = {}
		data.lat = this.props.elementData ? ( this.props.elementData.latitude || 0 ) : 0
		data.long = this.props.elementData ? ( this.props.elementData.longitude || 0 ) : 0
		let dialogTitle = <div className="modaltitle">
							<span className="diadlogTitleText">Geo Location</span>
							<i className='fa fa-map-marker iconmodal'></i>
						</div>
		return (
            <td className={'mdl-data-table__cell--non-numeric pointer'+requiredClass} onDoubleClick={this.openCloseModal.bind(this,true)}>
            	<span className="color888 expandleftpspan">{ JSON.stringify(data) }</span>
            	<i className="fa fa-expand fr expandCircle" aria-hidden="true" onClick={this.openCloseModal.bind(this,true)}></i>
            	<Dialog title={ dialogTitle } modal={false} open={this.state.isModalOpen} onRequestClose={this.cancelGeoUpdate.bind(this)}>
	          		<div className="latdiv">
	          			<p className="headinlatlon">Latitude </p>
	          			<p className="ptaglatlong">Latitude must be range of -90 to 90</p>
		          		<TextField
					      hintText="Latitude"
					      floatingLabelText="Enter a Latitude"
					      value={
					      	this.props.elementData ? (this.props.elementData.document.latitude || '') : ''
					      }
					      onChange={this.changeHandler.bind(this,'latitude')}
					      type="number"
					      className="textfiledgeo"
					      errorText={ this.state.errmsg }
					    />
				    </div>
				    <div className="londiv">
				    	<p className="headinlatlon">Longitude </p>
				    	<p className="ptaglatlong">Longitude must be range of -180 to 180</p>
					    <TextField
					      hintText="Longitude"
					      floatingLabelText="Enter a Longitude"
					      value={
					      	this.props.elementData ? (this.props.elementData.document.longitude || '') : ''
					      }
					      onChange={this.changeHandler.bind(this,'longitude')}
					      type="number"
					      className="textfiledgeo"
					      errorText={ this.state.errmsg }
					    />
				    </div>
				    <div className="geodiv">
		          		<button className="btn btn-primary fr" onClick={this.GeoSave.bind(this)}>Submit</button>
	          		</div>
        		</Dialog>
            </td>
		);
	}
}

export default GeoTdComponent;