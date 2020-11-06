import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {flattenJson} from '../../util'
import _ from 'lodash'

class LiveView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    expandComponent(row) {
        let expandDiv = [];
        let propertyDiv = [];
        let flattenEventProperties = flattenJson(row.data);
        let i = 0;
        for (let key in flattenEventProperties) {
            i++;
            propertyDiv.push(
                <div class="col-sm-4 col-xs-4 propertyDiv">
                    <div class="property">
                        <span class="key">{key.replace(/[.]/g, ' ') + ' :'}</span>
                        <span class="value" title={flattenEventProperties[key]}>{flattenEventProperties[key]}</span>
                    </div>
                </div>
            );
            if (i % 3 == 0) {
                let propertyRow = (
                    <div class="propertyRow">
                        {propertyDiv}
                    </div>
                );
                expandDiv.push(propertyRow);
                i = 0;
                propertyDiv = [];
            }
        }
        if (propertyDiv.length) {
            let propertyRow = (
                <div class="propertyRow">
                    {propertyDiv}
                </div>
            );
            expandDiv.push(propertyRow);
        }
        return (
            <div class="propertyDivContainer">{expandDiv}</div>
        );
    }

    isExpandableRow(row) {
        return true;
    }

    renderCustom(cell, row, extra) {
        const value = _.get(row, extra.path)
        return value
    }

    trClassFormat(row, rIndex) {
        return row.newEvent
            ? 'liveview-table newEvent'
            : 'liveview-table';
    }
    render() {

        const options = {
            noDataText: 'No Events Found!!',
            onlyOneExpanding: true
        };

        const allEvents = this.props.events || [];
        return (
            <BootstrapTable data={allEvents}
                            options={options}
                            hover
                            expandableRow={this.isExpandableRow}
                            expandComponent={this.expandComponent}
                            trClassName={this.trClassFormat}
                            tableHeaderClass='my-header-class'
                            tableBodyClass='my-body-class'
                            containerClass='my-container-class'
                            tableContainerClass='my-table-container-class'
                            headerContainerClass='my-header-container-class'
                            bodyContainerClass='my-body-container-class'>

                <TableHeaderColumn isKey={true}
                                   dataField='_id'
                                   className="tableHeading"
                                   columnClassName="liveview-table-data">
                    Distinct Id
                </TableHeaderColumn>

                <TableHeaderColumn dataField='name'
                                   className="tableHeading"
                                   columnClassName="liveview-table-data">
                    Event
                </TableHeaderColumn>

                <TableHeaderColumn dataField='createdAt'
                                   className="tableHeading"
                                   dataSort={true}
                                   columnClassName="liveview-table-data">
                    Time
                </TableHeaderColumn>

                <TableHeaderColumn dataField={'browser'}
                                   className="tableHeading"
                                   columnClassName="liveview-table-data"
                                   dataFormat={this.renderCustom} formatExtraData={{ path: 'data.device.browser' }}>
                    Browser
                </TableHeaderColumn>

                <TableHeaderColumn dataField='data.device.city'
                                   dataFormat={this.renderCustom}
                                   formatExtraData={{ path: 'data.device.city' }}
                                   className="tableHeading"
                                   columnClassName="liveview-table-data">
                    City
                </TableHeaderColumn>

                <TableHeaderColumn dataField='data.device.country'
                                   dataFormat={this.renderCustom}
                                   formatExtraData={{ path: 'data.device.country' }}
                                   className="tableHeading"
                                   columnClassName="liveview-table-data">
                    Country
                </TableHeaderColumn>
            </BootstrapTable>
        );

    }

}
function mapStateToProps(state) {
    const {events, currentPage, totalPages} = state.eventsPage;
    const {loading} = state.loader;
    return {events, currentPage, totalPages, loading};
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(LiveView);
