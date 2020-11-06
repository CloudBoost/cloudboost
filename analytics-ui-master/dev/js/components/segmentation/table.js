import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import _ from 'underscore'
import {month} from '../../util'

class SegementationTable extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderTableRows() {

        let rows = [];
        let labels = _.allKeys(this.props.periodEvents);
        labels = labels.splice(-4);
        labels.reverse();

        _.each(this.props.eventsName, (eventName) => {
            let obj = {};

            _.each(labels, (label, i) => {
                obj.label = label;

                if (this.props.periodEvents[label][eventName])
                    obj[i] = this.props.periodEvents[label][eventName].length
                else
                    obj[i] = 0
            });

            obj.event = eventName;
            rows.push(obj);
            obj = {}
        });
        return rows
    }

    renderTableRowss() {

        let x = _.map(((_.allKeys(this.props.periodEvents)).splice(-4)).reverse(), (label, i) => {
            return (
                <TableHeaderColumn key={i}
                                   dataField={'0'}
                                   dataSort={true}
                                   columnClassName="liveview-table-data">
                    {label}
                </TableHeaderColumn>
            )
        });
        return x;
    }

    render() {
        const options = {
            noDataText: 'No Events Found!!'
        };

        let tableData = this.renderTableRows();
        let tableRows = this.renderTableRowss();
        let labels = ((_.allKeys(this.props.periodEvents)).splice(-4)).reverse();

        console.log(tableData);
        return (
            <table className="segmentation-table">
                <thead className="segmentation-table-header-container">
                <tr className="segmentation-table-header-row">
                    <th className="segmentation-table-header-field">Event</th>
                    {
                        labels.map((label, index) => {
                            let date = new Date(parseInt(label))
                            return (
                                <th key={index} className="segmentation-table-header-field">
                                    {month[date.getMonth()] + ' ' + date.getDate()}
                                </th>
                            );
                        })
                    }
                </tr>
                </thead>
                <tbody className="segmentation-table-data-container">
                {
                    tableData.map((data, index) => {
                        if (this.props.chartFilters[tableData[index]['event']])
                            return (<tr key={index} className="segmentation-table-data-row">
                                <td className="segmentation-table-data-field">{tableData[index]['event']}</td>
                                {tableData[index][0] &&
                                <td class="segmentation-table-data-field">{tableData[index][0]}</td>}
                                {tableData[index][1] &&
                                <td class="segmentation-table-data-field">{tableData[index][1]}</td>}
                                {tableData[index][2] &&
                                <td class="segmentation-table-data-field">{tableData[index][2]}</td>}
                                {tableData[index][3] &&
                                <td class="segmentation-table-data-field">{tableData[index][3]}</td>}
                            </tr>)
                    })
                }
                </tbody>
            </table>
        );
    }

}

function mapStateToProps(state) {
    const {appInitSuccess, init, fetchingEvents} = state.app;
    const {events, eventsName} = state.allEvents;
    const {day, week, month} = state.groupedEvents;
    return {eventsName};
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(SegementationTable);
