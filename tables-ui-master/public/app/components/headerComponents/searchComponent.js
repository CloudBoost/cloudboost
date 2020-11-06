import React from 'react'
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
var Loader = require('halogen/ScaleLoader')


class Search extends React.Component {
	constructor(){
		super()
		this.state = {
			open: false
		}
	}
	search(e){
		this.props.search(e.target.value)
	}
	clearSearch(){
		this.props.search('')
	}
	componentWillMount(){

	}
	handleTouchTap(event){
		// This prevents ghost click.
		event.preventDefault();
		this.setState({
		  open: true,
		  anchorEl: event.currentTarget
		})
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
		return (
			<div style={{display:'inline'}}>

				<div id="loaderTop" className="" style={{display:'none'}}>
					<Loader color="#666" className="loadertop"/>
				</div>

				<i className="fa fa-search searchheading cp" aria-hidden="true" onTouchTap={this.handleTouchTap.bind(this)}></i>
				<Popover
		          open={this.state.open}
		          anchorEl={this.state.anchorEl}
		          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
		          targetOrigin={{horizontal: 'left', vertical: 'top'}}
		          onRequestClose={this.handleRequestClose.bind(this)}
		          animation={PopoverAnimationVertical}
		          className="popupsearchcol"
		        >
					<input className="searchinputpop" placeholder="Search.." onChange={ this.search.bind(this) } value={ this.props.searchString }/>
					<i className="fa fa-times searchclose cp" aria-hidden="true" onClick={ this.clearSearch.bind(this) }></i>
		        </Popover>
			</div>
		);
	}
}

export default Search;