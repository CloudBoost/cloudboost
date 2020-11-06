import React, {Component} from 'react';
import {ButtonGroup, DropdownButton, Check} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import QueryStep from '../../elements/queryStep.js';
import {DateRange, defaultRanges} from 'react-date-range';
import {fetchAllEvents, filterEvents, changeChartFilters} from '../../actions';
import _ from 'underscore';
import DatePicker from 'material-ui/DatePicker';
import Select from 'react-select';
import SegmentationChart from './chart'
import {Popover, MenuItem, SelectField} from 'material-ui';
import {generateHash, validateQueryFields, filterColors, formatDate, chartFillColors} from '../../util';
import SegementationTable from './table';

class Segementation extends Component {

    constructor(props) {
        super(props);

        const startDate = new Date();
        const endDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        this.state = {
            queryStepCount: 0,
            queryArr: [],
            rangePicker: {},
            isOrQuery: true,
            open: false,
            values: [],
            value: 0,
            chartFilters: {},
            obj: {},
            startDate,
            endDate
        };
    }

    handleChangeStartDate = (event, date) => {
        this.setState({startDate: date});
    };

    handleChangeEndDate = (event, date) => {
        this.setState({endDate: date});
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };

    handleChange2 = (value) => this.setState({value});

    componentWillReceiveProps(nextProps) {

        if (nextProps.filteredEventsName !== this.props.filteredEventsName) {
            this.state.chartFilters = {};
            _.each(nextProps.filteredEventsName, (event) => this.state.chartFilters[event] = true);
            this.state.periodEvents = this.props.day;
        }

        this.setState(this.state)
    }

    componentDidUpdate() {

        if (!this.state.periodEvents && this.props.day) {
            this.state.periodEvents = this.props.day;
            this.state.periodType = 'day';
            this.setState(this.state);
        }

        $('.segmentation-event-list-item').click(function () {
            $('#segmentation-event-dropdown').text($(this).text());
        });

        $('.segmentation-chart-filter').children().find('.checkbox-design').each(i => {
            // let randomColor = Math.floor(Math.random() * 16777215).toString(16);
            $(this).css("background-color", filterColors[i]);
        });
    }

    componentWillMount() {
        if (!this.props.init) this.props.fetchAllEvents()
    }

    componentDidMount(){
        this.addQueryStep();
    }

    toggleQuerySwitch() {
        this.state.isOrQuery = !this.state.isOrQuery;
        this.setState(this.state);
    }

    renderAllEventList() {
        if (this.props.eventsName) {
            let allEvents = this.props.eventsName.map((eventName, i) => {
                // return (<MenuItem value={i} key={i} primaryText={eventName}/>);
                return {
                    value: i,
                    label: eventName,
                    key: i
                };
            });
            return allEvents;
        }
    }

    handleCompareListChange = (event, index, values) => this.setState({values})

    menuItems(values) {
        return this.props.eventsName.map(name => {
            return <MenuItem key={name}
                             insetChildren={true}
                             checked={values && values.includes(name)}
                             value={name}
                             primaryText={name}/>
        })
    }

    addQueryStep() {
        const hash = generateHash();

        this.state.obj[hash] = {
            includeQuery: true
        };

        this.state.queryStepCount++;
        let arr = this.state.queryArr;
        arr.push(<QueryStep index={this.state.queryStepCount - 1}
                            key={this.state.queryStepCount - 1}
                            ts={hash}
                            deleteQuery={this.deleteQueryStep.bind(this)}
                            handleQueryChange={this.handleQueryChange.bind(this)}
                            handlePropertyChange={this.handlePropertyChange.bind(this)}
                            handleValueChange={this.handleValueChange.bind(this)}/>);
        this.state.queryArr = arr;
        this.setState(this.state);
    }

    handlePropertyChange(value, index) {
        if (!this.state.obj[index])
            this.state.obj[index] = {};
        this.state.obj[index]['property'] = value;
        this.setState(this.state);

    }

    handleQueryChange(value, index) {
        if (!this.state.obj[index])
            this.state.obj[index] = {};
        this.state.obj[index]['query'] = value;
        this.setState(this.state);
    }

    handleValueChange(value, index) {
        if (!this.state.obj[index])
            this.state.obj[index] = {}
        this.state.obj[index]['value'] = value;
        this.setState(this.state);

    }

    renderChartFilters() {

        if (this.props.eventsName) {
            let maxIndex = this.props.eventsName.length;
            let allEvents = this.props.eventsName.map((eventName, i) => {
                return (
                    <div className=" segmentation-chart-filter-list col-md-2 col-xs-3"
                         key={i}
                         style={{
                             borderLeft: i === 0 ? 0 : 1,
                             borderRight: ( i === maxIndex - 1 ) ? 0 : 1
                         }}>
                        <label className="segmentation-chart-filter-item">
                            <div className="checkbox-design"
                                 style={{backgroundColor: chartFillColors[i]}}
                                 id={"chartFilter" + eventName}
                                 onClick={this.handleChartFilter.bind(this, eventName)}>{' '}
                            </div>
                            {eventName}
                        </label>
                    </div>
                );
            });
            return allEvents;
        }
    }

    handleChartFilter(event) {
        $('#chartFilter' + event).toggleClass('white');
        this.state.chartFilters[event] = !this.state.chartFilters[event]
        //console.log(this.state.chartFilters);
        this.setState(this.state);
        this.props.changeChartFilters(this.state.chartFilters)
    }

    handlePeriodChange(type) {

        if (type === 'day') {
            this.state.periodType = 'day';
            this.state.periodEvents = this.props.day;
        }
        else if (type === 'week') {
            this.state.periodType = 'week';
            this.state.periodEvents = this.props.week;
        }
        else if (type === 'month') {
            this.state.periodType = 'month';
            this.state.periodEvents = this.props.month;
        }

        this.setState(this.state);
    }

    deleteQueryStep(index, key) {
        this.state.queryArr = this.state.queryArr.filter((element) => {
            return (element.props.index !== index)
        });
        this.state.queryStepCount--;
        delete this.state.obj[key]
        this.setState(this.state);

    }

    addQueryToEvents() {
        //console.log(this.props.eventsName[this.state.value], this.state.isOrQuery);
        if (validateQueryFields(this.state.obj, true)) {
            this.props.filterEvents({
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                obj: this.state.obj,
                eventName: this.props.eventsName[this.state.value],
                isOrQuery: this.state.queryStepCount > 1 ? this.state.isOrQuery : false
            })
        }
    }

    filterEvents() {
        if (validateQueryFields(this.state.obj, true)) {
            this.props.filterEvents({
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                obj: this.state.obj,
                eventName: this.props.eventsName[this.state.value],
                isOrQuery: this.state.queryStepCount > 1 ? this.state.isOrQuery : false
            })
        }
        else {
            this.props.filterEvents({
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                eventName: this.props.eventsName[this.state.value],
                isOrQuery: this.state.queryStepCount > 1 ? this.state.isOrQuery : false
            })
        }
    }

    formatDate(date) {
        return formatDate(date)
    }

    render() {
        const {values} = this.state;

        const chartFilters = this.renderChartFilters();
        const asdfg = this.state.chartFilters;

        return (
            <div>
                <div className="segmentation-details">

                    <div className="segmentation-details-header">
                        <span className="event-label">Select Event</span>
                        <Select value={this.state.value}
                                onChange={this.handleChange2.bind(this)}
                                options={this.renderAllEventList()}
                                className={`event-dd `}
                                placeholder="Select Event"
                                clearable={false}/>
                    </div>

                    <div className="segmentation-details-body">
                        <div className={this.state.queryStepCount > 1 ? "segmentation-details-label " : 'hide'}>
                            <span onClick={this.toggleQuerySwitch.bind(this)}
                                  className={this.state.isOrQuery ? "segmentation-details-and-label and-or-label-background " : "segmentation-details-and-label "}>
                                AND
                            </span>
                            <span onClick={this.toggleQuerySwitch.bind(this)}
                                  className={!this.state.isOrQuery ? "segmentation-details-or-label and-or-label-background " : "segmentation-details-or-label "}>
                                {'OR '}
                            </span>
                        </div>
                        {this.state.queryArr}
                        <i className="ion ion-plus-round segmentation-details-addrule-icon"
                           onClick={this.addQueryStep.bind(this)}/>
                    </div>

                    <div className="segmentation-details-footer">
                        <button className="btn btn-primary segmentation-details-show-btn pull-right"
                                onClick={this.addQueryToEvents.bind(this)}>Show
                        </button>
                    </div>

                </div>
                <div className="segmentation-chart-header">
                    <div className="datepicker-container">
                        <DatePicker textFieldStyle={{width: '150px', fontSize: 14}}
                                    hintText="Start Date"
                                    formatDate={this.formatDate.bind(this)}
                                    onChange={this.handleChangeStartDate}
                                    autoOk={true}
                                    mode="landscape"
                                    defaultDate={this.state.startDate}
                                    hideCalendarDate={true}
                                    container="inline"/>
                        <i className="ion ion-minus-round" style={{margin: 'auto 10px'}}/>
                        <DatePicker textFieldStyle={{width: '150px', fontSize: 14}}
                                    hintText="End Date"
                                    formatDate={this.formatDate.bind(this)}
                                    onChange={this.handleChangeEndDate}
                                    autoOk={true}
                                    mode="landscape"
                                    defaultDate={this.state.endDate}
                                    hideCalendarDate={true}
                                    container="inline"/>
                    </div>
                    <div className="option-container">
                        <button className="btn btn-primary segmentation-done-btn"
                                onClick={this.filterEvents.bind(this)}>
                            Done
                        </button>
                        <div className="pull-right">
                            <DropdownButton title="Day"
                                            id="segmentation-period-dropdown"
                                            style={{minWidth: 88}}>

                                <MenuItem className="segmentation-period-list-item" key={1}
                                          onClick={this.handlePeriodChange.bind(this, 'day')}
                                          style={{lineHeight: "32px", minHeight: 32}}>Day</MenuItem>
                                <MenuItem className="segmentation-period-list-item" key={2}
                                          onClick={this.handlePeriodChange.bind(this, 'week')}
                                          style={{lineHeight: "32px", minHeight: 32}}>Week</MenuItem>
                                <MenuItem className="segmentation-period-list-item" key={3}
                                          onClick={this.handlePeriodChange.bind(this, 'month')}
                                          style={{lineHeight: "32px", minHeight: 32}}>Month</MenuItem>
                            </DropdownButton>
                        </div>
                    </div>
                    {/*<IconButton className="segmentation-compare-icon" data-tip data-for="compare-icon" onTouchTap={this.handleTouchTap} touch={true}>
                                <CompareIcon/>
                            </IconButton>*/}
                </div>
                <div className="segmentation-chart-filter">
                    <div style={{
                        backgroundColor: "rgb(255, 254, 247)",
                        border: "1px solid #e5d8be",
                        height: 32
                    }}>
                        {chartFilters}
                    </div>
                </div>
                <div className="segmentation-chart">
                    <div style={{margin: "0 20px"}}>
                        <SegmentationChart periodEvents={this.state.periodEvents} chartFilters={asdfg}/>
                    </div>
                </div>
                <div className="segmentation-data">
                    <SegementationTable periodEvents={this.state.periodEvents}
                                        periodType={this.state.periodType}
                                        chartFilters={asdfg}/>
                </div>
                <Popover open={this.state.open}
                         anchorEl={this.state.anchorEl}
                         anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                         targetOrigin={{horizontal: 'left', vertical: 'top'}}
                         onRequestClose={this.handleRequestClose}>
                    <SelectField maxHeight={200}
                                 multiple={true}
                                 hintText="Select Events"
                                 value={values}
                                 onChange={this.handleCompareListChange}>
                        {this.menuItems(values)}

                    </SelectField>
                </Popover>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {appInitSuccess, init, fetchingEvents} = state.app;
    const {events, eventsName, filteredEvents, filteredEventsName} = state.allEvents;
    const {day, week, month} = state.groupedEvents;
    return {
        events,
        appInitSuccess,
        fetchingEvents,
        init,
        day,
        week,
        month,
        eventsName,
        filteredEvents,
        filteredEventsName
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchAllEvents,
        filterEvents,
        changeChartFilters
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Segementation);
