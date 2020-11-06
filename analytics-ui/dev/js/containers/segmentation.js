import React, {Component} from 'react';
import {ButtonGroup, DropdownButton, Check} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from "react-router";
import QueryStep from '../elements/queryStep.js';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {DateRange, defaultRanges} from 'react-date-range';
import ReactTooltip from 'react-tooltip';
import {fetchAllEvents} from '../actions/index';
import CompareIcon from 'material-ui/svg-icons/action/compare-arrows';
import _ from 'underscore'

import {
    IconButton,
    Popover,
    Menu,
    MenuItem,
    SelectField,
    DropDownMenu
} from 'material-ui';
import {tableData} from '../fakeAPI'
import {filterColors, chartFillColors} from '../util'

class Segementation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queryStepCount: 0,
            queryArr: [],
            rangePicker: {},
            andQuerySelected: true,
            open: false,
            values: [],
            value: 1
        };
    }

    handleTouchTap = (event) => {
        event.preventDefault();

        this.setState({open: true, anchorEl: event.currentTarget});
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };
    randomLabels() {
        let labels = [];
        let {periodEvents} = this.state;
        if (periodEvents)
            for (let i = 0; i < periodEvents.length; i++) {
                let date = new Date(parseInt(periodEvents[i].day))
                var month = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
                ];
                var str = month[date.getMonth()] + ' ' + date.getDate();
                labels.push(str);
            }
        return labels;
    }

    randomDataset() {
        let datasets = [],
            data = [];
        // let daysEvents = this.props.day;
        let {periodEvents} = this.state
        if (periodEvents)
            for (let j = 0; j < 12; j++) {
                for (let i = 0; i < periodEvents.length; i++) {
                    if (periodEvents[i].events[j])
                        data.push(periodEvents[i].events[j].object.length);
                    }
                datasets.push({
                    label: 'View ' + (j + 1),
                    data: data,
                    backgroundColor: chartFillColors[j],
                    borderColor: filterColors[j],
                    fill: false,
                    lineTension: '0.1',
                    borderWidth: 1
                });
                data = [];
            }
        return datasets;
    }

    handleChange2 = (event, index, value) => this.setState({value});

    componentDidUpdate() {
        if (!this.state.periodEvents && this.props.day) {
            this.state.periodEvents = this.props.day;
            this.setState(this.state);
        }
        const chartData = {
            labels: this.randomLabels(),
            datasets: this.randomDataset()
        };
        var ctx = $("#segmentationChart");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            }
        });
        $('.segmentation-event-list-item').click(function() {
            console.log('clicked');
            $('#segmentation-event-dropdown').text($(this).text());
        });

        $('.segmentation-chart-filter').children().find('.checkbox-design').each(function(i) {
            //            let randomColor = Math.floor(Math.random() * 16777215).toString(16);

            $(this).css("background-color", filterColors[i]);
        });

        $('.segmentation-chart-filter-item').click(function() {
            $(this).find('div').toggleClass('white');
        })
    }

    componentDidMount() {
        const chartData = {
            labels: this.randomLabels(),
            datasets: this.randomDataset()
        };
        this.addQueryStep();
        $('.segmentation-chart-filter').children().find('.checkbox-design').each(function() {
            let randomColor = Math.floor(Math.random() * 16777215).toString(16);

            $(this).css("background-color", "#" + randomColor);
        });

        $('.segmentation-chart-filter-item').click(function() {
            $(this).find('div').toggleClass('white');
        })

        var ctx = $("#segmentationChart");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            }
        });
    }
    toggleQuerySwitch() {
        this.state.andQuerySelected = !this.state.andQuerySelected;
        this.setState(this.state);
    }
    renderAllEventList() {
        if (this.props.allEventsName) {
            let allEvents = this.props.allEventsName.map((eventName, i) => {
                return (
                    <MenuItem class="segmentation-event-list-item" key={i}>{eventName}</MenuItem>
                );
            });
            return allEvents;
        }
    }

    handleChange(which, payload) {
        this.state[which] = payload
        this.setState(this.state);
    }
    handleCompareListChange = (event, index, values) => this.setState({values})

    menuItems(values) {
        return this.props.allEventsName.map((name) => (<MenuItem key={name} insetChildren={true} checked={values && values.includes(name)} value={name} primaryText={name}/>));
    }

    addQueryStep() {
        this.state.queryStepCount++;
        let arr = this.state.queryArr;
        // arr.push(<QueryStep key={this.state.queryStepCount} index={this.state.queryStepCount - 1} deleteQuery={this.deleteQueryStep.bind(this)}/>);
        this.state.queryArr = arr;
        this.setState(this.state);
    }
    renderChartFilters() {

        if (this.props.allEventsName) {
            let allEvents = this.props.allEventsName.map((eventName, i) => {
                return (
                    <div class=" segmentation-chart-filter-list col-md-2 col-xs-3" key={i}>
                        <label class="segmentation-chart-filter-item">
                            <div class="checkbox-design">{' '}</div>
                            {eventName}
                        </label>
                    </div>
                );
            });
            return allEvents;
        }
    }
    handlePeriodChange(type) {
        if (type === 'day')
            this.state.periodEvents = this.props.day;
        else if (type === 'week')
            this.state.periodEvents = this.props.week;
        else if (type === 'month')
            this.state.periodEvents = this.props.month;
        this.setState(this.state);
    }

    deleteQueryStep(index) {
        console.log(index);
        this.state.queryArr = this.state.queryArr.filter((element) => {
            return (element.props.index !== index)
        });
        this.state.queryStepCount--;
        this.setState(this.state);

    }

    render() {
        const options = {
            noDataText: 'No Events Found!!'
        }
        const {values} = this.state;

        const format = 'MMM D\' YYYY';
        const allEventList = this.renderAllEventList();
        const chartFilters = this.renderChartFilters();

        return (
            <div>
                <div class="segmentation-details">
                    <div class="segmentation-details-header">
                        <ButtonGroup vertical>
                            <DropdownButton title="Select Event" id="segmentation-event-dropdown">
                                {allEventList}
                            </DropdownButton>
                        </ButtonGroup>
                    </div>
                    <div class="segmentation-details-body">
                        <div class="segmentation-details-label ">
                            <span onClick={this.toggleQuerySwitch.bind(this)} class={this.state.andQuerySelected
                                ? "segmentation-details-and-label and-or-label-background "
                                : "segmentation-details-and-label "}>AND</span>
                            <span onClick={this.toggleQuerySwitch.bind(this)} class={!this.state.andQuerySelected
                                ? "segmentation-details-or-label and-or-label-background "
                                : "segmentation-details-or-label "}>OR</span>
                        </div><br/>
                        <br></br>
                        {this.state.queryArr}
                        <i class="ion ion-plus-round segmentation-details-addrule-icon" onClick={this.addQueryStep.bind(this)}></i>
                    </div>
                    <div class="segmentation-details-footer">
                        <button class="btn btn-info segmentation-details-show-btn">Show</button>
                    </div>
                </div>
                <div class="segmentation-chart-header">
                    <div class="segmentation-date-range-selector">
                        {/* use material date picker */}
                        {/* <input class="segmentation-date-range-field" type='text' readOnly value={this.state.rangePicker['startDate'] && this.state.rangePicker['startDate'].format(format).toString()}/>
                        <input class="segmentation-date-range-field" type='text' readOnly value={this.state.rangePicker['endDate'] && this.state.rangePicker['endDate'].format(format).toString()}/> */}
                        <button class="btn btn-primary segmentation-done-btn">Done</button>
                        <div class="segmentation-chart-options">
                            <ButtonGroup vertical>
                                <DropdownButton title="Day" id="segmentation-period-dropdown">
                                    <MenuItem class="segmentation-period-list-item" key={1} onClick={this.handlePeriodChange.bind(this, 'day')}>Day</MenuItem>
                                    <MenuItem class="segmentation-period-list-item" key={2} onClick={this.handlePeriodChange.bind(this, 'week')}>Week</MenuItem>
                                    <MenuItem class="segmentation-period-list-item" key={3} onClick={this.handlePeriodChange.bind(this, 'month')}>Month</MenuItem>
                                </DropdownButton>
                            </ButtonGroup>
                            <IconButton class="segmentation-compare-icon" data-tip data-for="compare-icon" onTouchTap={this.handleTouchTap} touch={true}>
                                <CompareIcon/>
                            </IconButton>
                            <ReactTooltip id='compare-icon' place="bottom" effect='solid'>
                                <span>{"Compare"}</span>
                            </ReactTooltip>
                        </div>

                    </div>
                    <div class="segmentation-chart-filter">
                        {chartFilters}
                    </div>
                    <div class="segmentation-date-range">
                        <DateRange ranges={defaultRanges} onInit={this.handleChange.bind(this, 'rangePicker')} onChange={this.handleChange.bind(this, 'rangePicker')}/>
                    </div>
                </div>
                <div class="segmentation-chart">
                    <canvas id="segmentationChart" width="400px" height="400px"></canvas>
                </div>
                <div class="segmentation-data">
                    <BootstrapTable height={'200px'} data={tableData} options={options} hover expandableRow={this.isExpandableRow} expandComponent={this.expandComponent} search={true} trClassName='liveview-table'>
                        <TableHeaderColumn dataField='event' dataSort={true} columnClassName="liveview-table-data">Event</TableHeaderColumn>
                        <TableHeaderColumn dataField='time' dataSort={true} columnClassName="liveview-table-data">Time</TableHeaderColumn>
                        <TableHeaderColumn dataField='browser' dataSort={true} columnClassName="liveview-table-data">Browser</TableHeaderColumn>
                        <TableHeaderColumn dataField='city' dataSort={true} columnClassName="liveview-table-data">City</TableHeaderColumn>
                        <TableHeaderColumn dataField='country' dataSort={true} columnClassName="liveview-table-data">Country</TableHeaderColumn>
                        <TableHeaderColumn dataField='distinctId' dataSort={true} isKey={true} columnClassName="liveview-table-data">Distinct Id</TableHeaderColumn>
                    </BootstrapTable>
                </div>
                <Popover open={this.state.open} anchorEl={this.state.anchorEl} anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }} targetOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }} onRequestClose={this.handleRequestClose}>
                    <SelectField maxHeight={200} multiple={true} hintText="Select Events" value={values} onChange={this.handleCompareListChange}>
                        {this.menuItems(values)}

                    </SelectField>
                </Popover>
            </div>

        );
    }

}
function mapStateToProps(state) {
    const {appInitSuccess, init, fetchingEvents} = state.app;
    const {events, eventsName} = state.allEvents;
    const {day, week, month} = state.groupedEvents;
    return {
        allEvents: events,
        appInitSuccess,
        fetchingEvents,
        init,
        day,
        week,
        month,
        allEventsName: eventsName
    };
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchAllEvents: fetchAllEvents
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(Segementation);
