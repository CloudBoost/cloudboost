import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getFunnelDataReport} from '../../actions'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {tableData} from '../../fakeAPI'
import _ from 'underscore'

class FunnelTable extends Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    renderTableRows() {
        let allvalueArr = this.props.tableData.map((value) => {
            return _.allKeys(value)
        });

        const properties = _.uniq(_.flatten(allvalueArr));

        let a = []
        properties.map((value, i) => {

            if (value !== 'event')
                a.push(
                    <tr key={i}  class="segmentation-table-data-row">
                        <td class="segmentation-table-data-field">{value}</td>
                        {_.pluck(this.props.funnelData, 'event').map((event, i) => {
                            return <td class="segmentation-table-data-field" key={i}>{this.props.tableData[i][value]}</td>
                        })}
                    </tr>
                )
            return
        })
        return a
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        if (nextProps === this.props && nextState === this.state)
            return false;
        else
            return true
    }
    render() {
        const options = {
            noDataText: 'No Events Found!!'
        }
        const tableRows = this.renderTableRows()

        return (

            <table class="segmentation-table">
                <thead class="segmentation-table-header-container">
                    <tr class="segmentation-table-header-row">
                        <th class="segmentation-table-header-field" key={0}>{this.props.property || 'device.browser'}</th>
                        {_.pluck(this.props.funnelData, 'event').map((event, i) => {
                            return <th class="segmentation-table-header-field" key={i + 1}>{event}</th>
                        })}
                    </tr>
                </thead>
                <tbody class="segmentation-table-data-container">
                    {tableRows}
                </tbody>
            </table>

        );
    }

}
function mapStateToProps(state) {

    const {funnels, funnelNames, funnelData, tableData} = state.funnels
    return {funnels, funnelNames, funnelData, tableData};
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        getFunnelDataReport
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(FunnelTable);
