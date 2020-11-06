import React from 'react'
import ReactDOM from 'react-dom'

class ViewACL extends React.Component {
	constructor(){
		super()
		this.state = {

		}
	}
	componentDidMount(){
		
	}
	render() {
		let users = 0
		let roles = 0
		let all = 0
		let str = ''
		let write = false
		let read = false
		if(this.props.aclList){
			for(var k in this.props.aclList){
				if(this.props.aclList[k].type == 'user' && this.props.aclList[k].id != 'all') users++
				if(this.props.aclList[k].type == 'role') roles++
				if(this.props.aclList[k].id == 'all') all++
				if(this.props.aclList[k].data.write) {
					write = true
				}
				if(this.props.aclList[k].data.read) {
					read = true
				}
			}
		}
		if(!users && !roles && write){
			str = <span>
            		<i className="fa fa-wikipedia-w" aria-hidden="true"></i>
	            	<span className="color888">  Public Read And Write</span>
            	</span>
		} 
		else if(!users && !roles && read){
			str = <span>
            		<i className="fa fa-wikipedia-w" aria-hidden="true"></i>
	            	<span className="color888">  Public Read</span>
            	</span>
		} else {
			str = <span>
            		<i className="fa fa-wikipedia-w" aria-hidden="true"></i>
	            	<span className="color888">  { users +' Users ' + roles + ' Roles' }</span>
            	</span>
		}
		if(!users && !roles && !all){
			str = <span>
            		<i className="fa fa-minus-circle" aria-hidden="true"></i>
	            	<span className="color888">  No rules specified</span>
            	</span>
		}
		return (
            <span className="expandleftpspan">{ str }</span>
		);
	}
}

export default ViewACL;