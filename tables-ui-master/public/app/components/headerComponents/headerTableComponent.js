import React from 'react'
import { observer } from "mobx-react"
import { Popover, PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import _ from 'underscore';

@observer
class HeaderTable extends React.Component {
	constructor() {
		super()
		this.state = {
			openNewTable: false,
			openDeleteTable: false,
			openTableSelector: false,
			tableName: '',
			tableTodelete: '',
			isModalOpen: false,
			tableSearch: '',
			addTableError : ''
		}
	}
	changeTable(name) {
		this.props.tableStore.changeTable(name)
		this.props.tableStore.showLoader()
		this.setState({ openTableSelector: false })
	}

	validateTableName(value = '', tableList = []) {
		const isContainPattern = new RegExp(/\W|_/);
		const isContainDigit = new RegExp(/\d+/);
		const isContainSpace = new RegExp(/\s+/);

		// Validating Table Name & Generating Errors
		if (value === '') {
			return 'Table Name cannot be empty.';
		} else if (isContainDigit.test(value[0])) {
			return 'Table Name cannot start with number.';
		} else if (isContainSpace.test(value)) {
			return 'Table Name cannot contain spaces.';
		} else if (isContainPattern.test(value)) {
			return 'Table Name cannot contain special characters.';
		} else {
			let sameTableName = _.filter(tableList, function (table) {
				return table.name.toLowerCase() === value.toLowerCase();
			});

			if (sameTableName.length > 0) {
				return 'Table Name already exists.';
			}
		}

		return true; // Table name is valid.
	}
	addtable(e) {
		e.preventDefault()

		const { tableName } = this.state;
		const tableList = Array.from(this.props.tableStore.tables)
		const isValidTableName = this.validateTableName(tableName, tableList);

		if (isValidTableName === true) {
			this.props.tableStore.showLoader()
			this.props.tableStore.createTable(this.state.tableName)
			this.state.openNewTable = false
			this.state.tableName = ''
			this.state.addTableError = ''
			this.setState(this.state)
		} else {
			this.setState({
				addTableError: isValidTableName
			})
		}
	}
	handleTouchTap(which, event) {
		// This prevents ghost click.
		event.preventDefault();
		this.state[which] = true
		this.state['anchorEl'] = event.currentTarget
		this.setState(this.state)
	}
	handleRequestClose(which) {
		this.state[which] = false
		this.setState(this.state)
	}
	changeHandler(which, e) {
		this.state[which] = e.target.value
		this.setState(this.state)
	}

	scrollTab(dir){
		const box = document.getElementById('box');
		const content = document.getElementById('content');
		const boxDim = box.getBoundingClientRect();
		const contentDim = content.getBoundingClientRect();

		if(dir === 'left'){
			const inc = (boxDim.left - 100) + contentDim.width;
			const truthy = (~boxDim.left > 0 || boxDim.left < 40) && inc < boxDim.width;
			if(truthy){
				box.style.left = inc > 40 ? 0 + 'px' : inc + 'px';
			}
		} else {
			const inc = (boxDim.left + 100) - contentDim.width;
			const truthy = boxDim.right > contentDim.width && Math.abs(inc) < boxDim.width;
			if(truthy){
				const rightContentDiff =  boxDim.right - contentDim.width;
				const boxContentDiff =  contentDim.width - boxDim.width;
				box.style.left = Math.abs(inc) > rightContentDiff ? boxContentDiff + 'px' : inc + 'px';
			}
		}
	}

	render() {
		let { getTables, TABLE } = this.props.tableStore
		let tables = []
		let tableSelectorList = []
		const {addTableError} = this.state;
		if (getTables.length) {
			tables = getTables.map((x, i) => {
				if (TABLE == x.name) return <div key={i} className="tableselected">
					<p className="tacenter" style={{ fontWeight: 'bold' }}>{x.name}</p>

				</div>
				else return <div key={i} className="tablenotselected cp" onClick={this.changeTable.bind(this, x.name)}>
					<p className="tacenter">{x.name}</p>

				</div>
			})

			tableSelectorList = getTables.filter((x) => {
				if (this.state.tableSearch) {
					return x.name.toLowerCase().includes(this.state.tableSearch)
				} else return true
			})
			.map((x, i) => {
				return <p className="tablenameselector" onClick={this.changeTable.bind(this, x.name)} key={i}>
					{
						TABLE == x.name ? <i className="fa fa-check tablecheckcselected" aria-hidden="true"></i> : ''
					}
					{x.name}
				</p>
			})
		}
		return (
			<div className="f-container">
				<div className="table-controls">
				<i className="fa fa-bars tablemenuheading" aria-hidden="true" onTouchTap={this.handleTouchTap.bind(this, 'openTableSelector')}></i>
				<i className="fa fa-plus tablemenuheading" aria-hidden="true"  onTouchTap={this.handleTouchTap.bind(this, 'openNewTable')}></i>
				<Popover
					open={this.state.openTableSelector}
					anchorEl={this.state.anchorEl}
					anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
					targetOrigin={{ horizontal: 'left', vertical: 'top' }}
					onRequestClose={this.handleRequestClose.bind(this, 'openTableSelector')}
					className="popuptableselector"
				>
					<i className="fa fa-search tablesearchnameicon" aria-hidden="true"></i>
					<input type="text" className="tablesearchname" placeholder="Find a table." onChange={this.changeHandler.bind(this, 'tableSearch')} value={this.state.tableSearch} />
					<div className="tablenamecontainer">
						{tableSelectorList}
					</div>
				</Popover>
				</div>
			<div id="content" className="table-list f-4 headertablecrud">
				<div id="box" style={{left: 0}} className="box">
				{tables}
				</div>
				<Popover
					open={this.state.openNewTable}
					anchorEl={this.state.anchorEl}
					anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
					targetOrigin={{ horizontal: 'left', vertical: 'top' }}
					onRequestClose={this.handleRequestClose.bind(this, 'openNewTable')}
					animation={PopoverAnimationVertical}
					className="popupaddtable"
				>
					<img src="public/app/assets/images/arrow-up.png" className="tablepoparrow" />
					<form onSubmit={this.addtable.bind(this)}>
						<p className="headingpop">ADD NEW TABLE</p>
						{addTableError ? <p className="addtable__Error">{addTableError}</p> : ""}
						<input className="inputaddtable" placeholder="Table name" onChange={this.changeHandler.bind(this, 'tableName')} value={this.state.tableName} required />
						<div className="addtablebutons">
							<button className="applyfiler">
								<i className="fa fa-check plusaddfilter" aria-hidden="true"></i>
								Apply
							</button>
						</div>
					</form>
				</Popover>

			</div>
			<div className="table-controls f-1">
				<i className="fa fa-chevron-left tablemenuheading" aria-hidden="true" onTouchTap={this.scrollTab.bind(this, 'left')}></i>
				<i className="fa fa-chevron-right tablemenuheading" aria-hidden="true" onTouchTap={this.scrollTab.bind(this, 'right')}></i>
				</div>
			</div>
		);
	}
}

export default HeaderTable;

// {['User', 'Role', 'Device'].indexOf(x.name) == -1 ? <i className="fa fa-caret-down deletear cp" aria-hidden="true" onTouchTap={this.handleTouchTap.bind(this, 'openDeleteTable')} data-table={x.name}></i> : ''}