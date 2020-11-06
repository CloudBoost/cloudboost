import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from "react-router";
import ReactTooltip from 'react-tooltip';
import _ from 'underscore';
import {fetchFunnel, fetchAllFunnels, deleteFunnel} from '../../actions';
import {DatePicker, MenuItem} from 'material-ui';

import {formatDate} from '../../util'

import QueryStep from '../../elements/queryStep.js';
import FunnelChart from './chart';
import FunnelTable from './table';
import Select from 'react-select';

const allQuery = ['equals', 'does not equal', 'greater than', 'starts with'];

class Funnel extends Component {

    constructor(props) {
        super(props);
        const startDate = new Date();
        const endDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        //endDate.setHours(0, 0, 0, 0);

        this.state = {
            rangePicker: {},
            showModal: false,
            queryArr: [],
            queryStepCount: 0,
            value: 0,
            obj: {},
            showQuery: false,
            property: 'device.browser',
            startDate,
            endDate
        };

    }

    renderAllQueryList() {
        return allQuery.map((query, i) => {
            return (<MenuItem value={i} primaryText={query} key={i}/>);
        });
    }

    handleChangeStartDate = (event, date) => {
        this.setState({startDate: date});
    };

    handleChangeEndDate = (event, date) => {
        this.setState({endDate: date});
    };

    handleChange = (obj) => {
        let data = {
            funnelObj: this.props.funnels[obj.value],
            property: this.state.property,
            startDate: this.state.startDate,
            endDate: this.state.endDate
        };
        this.props.fetchFunnel(data);
        this.setState({value: obj.value});
    };

    componentWillReceiveProps(nextProps) {

        if ( this.props.funnels.length !== nextProps.funnels.length) {
            let data = {
                funnelObj: nextProps.funnels[0],
                property: this.state.property,
                startDate: this.state.startDate,
                endDate: this.state.endDate
            };
            this.props.fetchFunnel(data)
        }
    }

    handlePropertyChange(obj) {
        let data = {
            funnelObj: this.props.funnelObj,
            property: obj.value,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            opts: true
        };
        this.props.fetchFunnel(data);
        this.setState({property: obj.value})
    }

    closeModal() {
        this.setState({showModal: false})
    }

    openModal() {
        this.setState({showModal: true});
    }

    componentWillMount() {
        if (!this.props.init)
            this.props.fetchAllFunnels();
        if (this.props.funnels.length && !_.isEmpty(this.props.funnels[0].data)) {
            let data = {
                funnelObj: this.props.funnels[0],
                property: this.state.property,
                startDate: this.state.startDate,
                endDate: this.state.endDate
            };
            this.props.fetchFunnel(data)
        }
    }

    navigate(route) {
        browserHistory.push(ANALYTICS_BASE_URL + this.props.currentAppId + '/' + route);
    }

    renderFunnelNamesList() {
        const {funnelNames} = this.props;
        return funnelNames.map((name, i) => {
            return {value: i, label: name, key: i};
        });

    }

    renderProperties() {
        const {properties} = this.props;
        return properties.map((property, i) => {
            return {value: property, label: property, key: i}
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps === this.props && nextState === this.state)
            return false;
        else
            return true
    }

    fetchFunnel() {
        let data = {
            funnelObj: this.props.funnelObj,
            property: this.state.property,
            startDate: this.state.startDate,
            endDate: this.state.endDate
        };
        this.props.fetchFunnel(data)
    }

    formatDate(date) {
        return formatDate(date)
    }

    deleteFunnel = () => {
        this.setState({showModal:false});
        this.props.deleteFunnel(this.props.funnelObj, this.props.currentAppId);
    };

    render() {
        const funnelNames = this.renderFunnelNamesList();
        const properties = this.renderProperties();

        return (
            <div>
                <div className="funnel-container">
                    <div className="funnel-page-header">
                        <div className="funnel-details">
                            <span className="funnel-label">Select Funnel</span>
                            <Select value={this.state.value}
                                    onChange={this.handleChange}
                                    options={funnelNames}
                                    placeholder="YOUR FUNNELS"
                                    className="funnel-event-dropdown"
                                    clearable={false}/>

                            <i className="ion ion-close-round icon" onClick={this.openModal.bind(this)}
                               data-tip="Delete Funnel" />
                            <i className="ion ion-edit icon" onClick={this.navigate.bind(this, 'editFunnel')}
                               data-tip="Edit Funnel" />
                            <i className="ion ion-plus-round icon" onClick={this.navigate.bind(this, 'createFunnel')}
                               data-tip="Create Funnel" />
                        </div>
                        <div className="funnel-options-selector">
                            <div className="datepicker-container">
                                <DatePicker textFieldStyle={{width: '150px'}}
                                            hintText="Start Date"
                                            formatDate={this.formatDate.bind(this)}
                                            onChange={this.handleChangeStartDate}
                                            autoOk={true}
                                            mode="landscape"
                                            defaultDate={this.state.startDate}
                                            container="inline"
                                            hideCalendarDate={true}/>
                                <i className="ion ion-minus-round" style={{margin: 'auto 10px'}}/>
                                <DatePicker textFieldStyle={{width: '150px'}}
                                            hintText="End Date"
                                            formatDate={this.formatDate.bind(this)}
                                            onChange={this.handleChangeEndDate}
                                            autoOk={true}
                                            mode="landscape"
                                            defaultDate={this.state.endDate}
                                            container="inline"
                                            hideCalendarDate={true}/>
                            </div>
                            <div className="option-container">
                                {
                                    this.props.funnelData.length ?
                                        <span className="funnel-completion-percentage">
                                        {parseFloat(this.props.funnelData[this.props.funnelData.length - 1].count * 100 / this.props.funnelData[0].count).toFixed(2) + ' % '}
                                        </span>
                                        :
                                        'NA '
                                }
                                <span className="funnel-completion-percentage-text">Completion rate</span>
                                <button className="btn btn-primary pull-right" onClick={this.fetchFunnel.bind(this)}>
                                    Show
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="funnel-chart">
                        <FunnelChart property={this.state.property}/>

                    </div>
                </div>

                <div className="funnel-data">

                    <div className="funnel-data-header">
                        <span className="funnel-data-heading col-md-1">Overview</span>
                    </div>

                    <div className="funnel-data-filter">
                        <span className="funnel-data-label col-md-3">Select Property</span>
                        <Select value={this.state.property}
                                onChange={this.handlePropertyChange.bind(this)}
                                options={properties}
                                placeholder="Select property"
                                className="funnel-property-dropdown"
                                clearable={false}/>
                    </div>

                    <div className="funnel-data-table">
                        <FunnelTable/>
                    </div>
                </div>
                <Modal className="small-height-modal"
                       show={this.state.showModal}
                       onHide={this.closeModal.bind(this)}>
                    <Modal.Header className="delete-modal-header-style">
                        <Modal.Title>
                            Delete
                            <img className="delete-modal-icon-style pull-right"/>
                            <div className="modal-title-inner-text">You are about to delete funnel {this.props.funnelNames[this.state.value]}</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="delete-modal-body">
                        Are you sure you want to delete
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="btn-danger"
                                onClick={this.deleteFunnel.bind(this)}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                <ReactTooltip place="bottom" effect='solid' />

            </div>

        );
    }

}

function mapStateToProps(state) {
    const {init, appId} = state.app;
    const {funnels, funnelNames, funnelData, funnelObj} = state.funnels;
    const {properties} = state.allEvents;

    return {
        funnels,
        funnelNames,
        funnelData,
        properties,
        funnelObj,
        init,
        currentAppId: appId
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            fetchFunnel,
            fetchAllFunnels,
            deleteFunnel
        },
        dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Funnel);
