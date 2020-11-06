import React from 'react'
import { observer } from "mobx-react"
import { Popover, PopoverAnimationVertical } from 'material-ui/Popover'
import FilterRow from './filterRowComponent.js'

@observer
class FilterRows extends React.Component {
	constructor() {
		super()
		this.state = {
			open: false,
			filters: [],
			andQuery: null,
			orQueries: [],
			finalQuery: null
		}
	}
	componentDidMount() {

	}
	addFilter() {
		let type = this.state.filters.length == 0 ? ['where'] : ['and', 'or']
		this.state.filters.push({
			type: type,
			id: Math.random().toString(36).substring(7),
			dataType: '',
			selectedType: '',
			filterType: '',
			dataValue: '',
			filterTypes: [],
			columnType: '',
			relatedTo: '',
			listDataValue: []
		})
		this.setState(this.state)
		// this.runQuery()
	}
	deleteFilter(id) {
		this.state.filters = this.state.filters.filter(x => x.id != id)
		if (this.state.filters[0]) {
			this.state.filters[0].type = ['where']
		}
		this.setState(this.state)
		// this.runQuery()
	}
	clearFilter() {
		this.setState({
			filters: [],
			andQuery: null,
			orQueries: [],
			finalQuery: null,
			open:false
		})
		this.props.tableStore.showLoader()
		this.props.tableStore.setColumnsData()
	}
	runQuery() {
		this.state.andQuery = null
		this.state.orQueries = []
		this.state.finalQuery = null
		this.setState(this.state)

		for (var k in this.state.filters) {
			if (this.state.filters[k].filterType != '' && this.state.filters[k].dataType != '') {
				this.buildQuery(this.state.filters[k])
			}
		}

		if (this.state.finalQuery) {
			this.props.tableStore.showLoader()
			this.state.finalQuery.find().then((res) => {
				this.props.tableStore.updateColumnsData(res)
			}, (err) => {
				console.log(err)
			})
		}
	}
	buildQuery(queryData) {
		if (this.state.andQuery == null) {
			this.state.andQuery = new CB.CloudQuery(this.props.tableStore.TABLE)
		}
		if (queryData.selectedType == '' || queryData.selectedType == 'and') {
			this.state.andQuery[queryData.filterType](queryData.dataType, queryData.dataValue)
		} else {
			let query = new CB.CloudQuery(this.props.tableStore.TABLE)
			this.state.orQueries.push(query[queryData.filterType](queryData.dataType, queryData.dataValue))
		}
		if (this.state.orQueries.length) {
			this.state.finalQuery = new CB.CloudQuery.or([...this.state.orQueries, this.state.andQuery])
		} else {
			this.state.finalQuery = this.state.andQuery
		}
		this.setState(this.state)
	}
	handleTouchTap(event) {
		// This prevents ghost click.
		event.preventDefault();
		this.setState({
			open: true,
			anchorEl: event.currentTarget
		})
	}
	handleRequestClose() {
		this.setState({
			open: false
		})
	}
	changeHandler(type, value, id, e) {
		this.state.filters = this.state.filters.map((x) => {
			if (x.id == id) {
				if (type == 'listDataValue') {
					x[type].push(value)
				} else {
					x[type] = value
				}
			}
			return x
		})
		this.setState(this.state)
		// this.runQuery()
	}
	removeListDataValue(index, id) {
		this.state.filters = this.state.filters.map((x) => {
			if (x.id == id) {
				x['listDataValue'].splice(index, 1)
			}
			return x
		})
		this.setState(this.state)
		// this.runQuery()
	}
	render() {
		let filters = this.state.filters.map((x, i) => {
			return <FilterRow
				key={i}
				tableStore={this.props.tableStore}
				filterData={x}
				deleteFilter={this.deleteFilter.bind(this)}
				runQuery={this.runQuery.bind(this)}
				changeHandler={this.changeHandler.bind(this)}
				removeListDataValue={this.removeListDataValue.bind(this)}
			/>
		})
		return (
			<div className="disinb">
				<button className="btn subhbtnpop" onTouchTap={this.handleTouchTap.bind(this)}><i className="fa fa-filter mr2" aria-hidden="true"></i>Filters</button>
				<Popover
					open={this.state.open}
					anchorEl={this.state.anchorEl}
					anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
					targetOrigin={{ horizontal: 'left', vertical: 'top' }}
					onRequestClose={this.handleRequestClose.bind(this)}
					animation={PopoverAnimationVertical}
					className="popupfilterrrow"
				>
					<button className="btn addfilter" onClick={this.addFilter.bind(this)}>
						<i className="fa fa-plus plusaddfilter" aria-hidden="true"></i>
						Add Filter
					</button>
					{
						filters.length ? 
							<div className="filterrowdiv">
								{ filters }
							</div> : <p className="nofiltertext">No filters applied to this view.</p>
					}
					<div className="filterbutton">
						<button className="clearfilter" onClick={this.clearFilter.bind(this)}>
							<i className="fa fa-ban plusaddfilter" aria-hidden="true"></i>
							Clear
						</button>
						<button className="applyfiler" onClick={this.runQuery.bind(this)}>
							<i className="fa fa-check plusaddfilter" aria-hidden="true"></i>
							Apply
						</button>
					</div>
				</Popover>
			</div>
		);
	}
}

export default FilterRows;