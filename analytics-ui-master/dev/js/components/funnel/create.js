import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {createFunnel} from '../../actions';
import QueryStep from '../../elements/queryStep.js';
import {generateHash, validateQueryFields} from '../../util';
import Select from 'react-select';
import {Row, Col} from 'react-bootstrap';
import RightArrow from 'material-ui/svg-icons/navigation/chevron-right';
import {blue500} from 'material-ui/styles/colors';
import {browserHistory} from "react-router";

class CreateFunnel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            steps: 0,
            stepsArr: [],
            obj: {},
            funnelName: ''
        };
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
            this.state.obj[index] = {};
        this.state.obj[index]['value'] = value;
        this.setState(this.state);
    }

    handleEventNameChange(index, event) {

        if (!this.state.obj[index])
            this.state.obj[index] = {};

        this.state.obj[index]['event'] = event.label;
        this.setState(this.state);
    }

    deleteStep(key) {
        if(this.state.steps > 2) {
            this.state.steps--;
            delete this.state.obj[key];
            this.setState(this.state);
        }
    }

    handleCheckBoxChange(hash) {
        this.state.obj[hash].includeQuery = !this.state.obj[hash].includeQuery;
        $('#queryDiv' + hash).css({display: this.state.obj[hash].includeQuery ? 'block' : 'none'});
        this.setState(this.state)
    }

    renderAllEventList() {
        if (this.props.eventsName) {

            return this.props.eventsName.map((eventName, i) => {
                return {value: eventName, label: eventName, key: i};
            });
        }
    }

    addFunnelStep(index) {

        const hash = generateHash();
        this.state.steps++;
        this.state.obj[hash] = {includeQuery: false};
        this.setState(this.state);
    }

    createFunnel() {

        if (!this.state.funnelName)
            $('#funnelName').css({border: '2px solid red'});
        else
            $('#funnelName').css({border: '1px solid #d9d9d9'});
        if (validateQueryFields(this.state.obj) && this.state.funnelName) {
            this.props.createFunnel(this.state.funnelName, this.state.obj, this.props.appId)
        }
    }

    componentWillMount() {
        this.addFunnelStep(0);
        this.addFunnelStep(1);
    }

    render() {

        return (
            <div className="cf">
                <div className="cf-heading">Create a new funnel</div>
                <div className="cf-body">
                    <input className="form-control"
                           placeholder="Enter funnel name"
                           id="funnelName"
                           onChange={(e) => this.setState({funnelName: e.target.value})}/>
                    {
                        Object.keys(this.state.obj)
                            .map((hash,index) => {
                                return <div className="funnelStep" key={hash}>

                                    <div className="fs-heading">
                                        <i className="ion ion-navicon-round fs-step-icon"/>
                                        Step {index+1}
                                        {
                                            index > 1 &&
                                            <i className="ion ion-close-circled pull-right fs-close-icon"
                                               onClick={this.deleteStep.bind(this, hash)}/>
                                        }
                                    </div>

                                    <div className="fs-property-body">
                                        <Row>
                                            <Col xs={3} md={3}>
                                                <Select value={this.state.obj[hash]['event']}
                                                        onChange={this.handleEventNameChange.bind(this, hash)}
                                                        options={this.renderAllEventList()}
                                                        placeholder="Select Event"
                                                        clearable={false}/>
                                            </Col>
                                            <Col xs={9} md={9} style={{paddingLeft: 0}}>
                                                {
                                                    !this.state.obj[hash].includeQuery &&
                                                    <div style={{
                                                        marginTop: 3,
                                                        border: "1px solid #bdc9d6",
                                                        alignItems: "center",
                                                        display: "inline-flex",
                                                        justifyContent: "center",
                                                        borderRadius: "50%",
                                                        boxShadow: "0 1px 1px 0 rgba(0,0,0,.2)",
                                                        width:28,
                                                        height:28,
                                                        backgroundColor:"white"

                                                    }}>
                                                        <RightArrow color={blue500}
                                                                    onClick={this.handleCheckBoxChange.bind(this, hash)}/>
                                                    </div>
                                                }
                                                {
                                                    this.state.obj[hash].includeQuery &&
                                                    <QueryStep index={index}
                                                               ts={hash}
                                                               parentComponent="CreateFunnel"
                                                               showDelete={ index > 1}
                                                               deleteQuery={this.handleCheckBoxChange.bind(this, hash)}
                                                               handleQueryChange={this.handleQueryChange.bind(this)}
                                                               handlePropertyChange={this.handlePropertyChange.bind(this)}
                                                               handleValueChange={this.handleValueChange.bind(this)}/>
                                                }
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            })
                    }
                    <i className="ion ion-plus-round segmentation-details-addrule-icon"
                       onClick={this.addFunnelStep.bind(this, this.state.steps)}/>
                    <button className="btn btn-primary pull-right"
                            onClick={this.createFunnel.bind(this)}>
                        Create Funnel
                    </button>
                    <button className="btn pull-right"
                            onClick={()=>browserHistory.push(ANALYTICS_BASE_URL + this.props.appId + '/funnel')}>
                        Cancel
                    </button>
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        appId: state.app.appId,
        eventsName: state.allEvents.eventsName
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({ createFunnel }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(CreateFunnel);
