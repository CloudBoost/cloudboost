import React, {Component} from 'react';
import {Table, Modal, Button} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import QueryStep from '../../elements/queryStep.js';
import ReactTooltip from 'react-tooltip';
import Select from 'react-select';
import {validateQueryFields} from '../../util';

class LiveView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queryArr: [],
            queryStepCount: 0,
            filter: 'event',
            value: null,
            addEventFilter: true,
            obj: {}
        };
    }

    addQueryStep() {
        this.state.queryStepCount++;
        let arr = this.state.queryArr;
        arr.push(<QueryStep index={this.state.queryStepCount - 1}
                            key={this.state.queryStepCount - 1}
                            ts={Date.now()}
                            deleteQuery={this.deleteQueryStep.bind(this)}
                            handleQueryChange={this.handleQueryChange.bind(this)}
                            handlePropertyChange={this.handlePropertyChange.bind(this)}
                            handleValueChange={this.handleValueChange.bind(this)}/>);
        this.state.queryArr = arr;
        this.setState(this.state);
    }

    deleteQueryStep(index, key) {
        this.state.queryArr = this.state.queryArr.filter(element => (element.props.index !== index));
        this.state.queryStepCount--;
        delete this.state.obj[key];
        this.setState(this.state);
    }

    // handleChange = (event, index, value) => this.setState({value});
    handleChange = (obj) => this.setState({value: obj.value});

    renderAllEventList() {
        if (this.props.eventsName) {
            return this.props.eventsName.map((eventName, i) => {
                return {value: i, label: eventName};
            });
        }
    }

    renderEventFilter() {

        const allEventList = this.renderAllEventList();

        return (
            <div>
                <div className="eventContainer">
                    <div className={this.state.addEventFilter ? 'eventRow' : 'hide'}>
                        <Select value={this.state.value}
                                onChange={this.handleChange}
                                options={allEventList}
                                placeholder="Select an event"
                                className="event-filter-dropdown"
                                clearable={false}/>
                        {/*<i className="ion ion-close-round delete-event-filter" onClick={() => this.setState({addEventFilter: false})} data-tip="Delete Filter"></i>*/}
                    </div>
                    <i className={( this.state.addEventFilter ? "ion ion-ios-arrow-back" : "ion ion-ios-arrow-forward") + "toggle-eventfilter-icon"}
                       onClick={() => this.setState({addEventFilter: !this.state.addEventFilter})}
                       data-tip="Add Event Filter"/>
                </div>
                {
                    this.state.value !== null &&
                    <div className="queryContainer">
                        {
                            this.state.queryStepCount > 0 ?
                                <div className="filter-header">
                                    <span className="filter-property-label">Only when all of the below are true</span>
                                </div>
                                :
                                <div className="filter-header"
                                     onClick={this.addQueryStep.bind(this)}
                                     style={{cursor:"pointer"}}>
                                    <span className="filter-property-label">
                                        <i className="icon ion-plus"/> Filter by a property
                                    </span>
                                </div>
                        }
                        {
                            this.state.queryArr.length > 0 &&
                            <div>
                                <div className="filter-body">
                                    <div className="fs-body"> {this.state.queryArr} </div>
                                </div>
                                <i className="ion ion-plus-round segmentation-details-addrule-icon cp add-query-btn"
                                   onClick={this.addQueryStep.bind(this)}/>
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }

    handleChangeFilter(e) {
        this.setState({filter: e.target.value})
    }

    filterEvents() {
        if (validateQueryFields(this.state.obj, true)) {
            this.props.filterEvents({
                event: this.props.eventsName[this.state.value],
                obj: this.state.obj,
                addEventFilter: this.state.addEventFilter
            });
            this.props.close();
        }
    }

    handlePropertyChange(value, index) {
        if (!this.state.obj[index])
            this.state.obj[index] = {}
        this.state.obj[index]['property'] = value;
        this.setState(this.state);

    }
    handleQueryChange(value, index) {
        if (!this.state.obj[index])
            this.state.obj[index] = {}
        this.state.obj[index]['query'] = value;
        this.setState(this.state);
    }
    handleValueChange(value, index) {
        if (!this.state.obj[index])
            this.state.obj[index] = {}
        this.state.obj[index]['value'] = value;
        this.setState(this.state);

    }
    render() {
        const renderEventFilterDiv = this.renderEventFilter()

        const allEvents = this.props.events || [];
        return (

            <Modal className="liveview-modal " show={this.props.show} onHide={this.props.close}>
                <Modal.Header className="modal-header-style">
                    <Modal.Title>
                        Filter Events
                        <img className="modal-icon-style pull-right filter-icon" />
                        <div className="modal-title-inner-text">Add filter on event name and properties.
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    {renderEventFilterDiv}
                    <ReactTooltip place="bottom" type="dark" delayShow={100}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={this.props.close}>Cancel</Button>
                    <Button bsStyle="primary" onClick={this.filterEvents.bind(this)}>Add</Button>
                </Modal.Footer>
            </Modal>

        );
    }

}
function mapStateToProps(state) {
    const {events, eventsName} = state.allEvents;
    const {event, obj, addEventFilter} = state.filter
    const {loading} = state.loader

    return {
        events,
        loading,
        eventsName,
        event,
        obj,
        addEventFilter
    };
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(LiveView);
