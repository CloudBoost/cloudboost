import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Select from 'react-select';

import LeftArrow from 'material-ui/svg-icons/navigation/chevron-left';
import {blue500} from 'material-ui/styles/colors'

const allQuery = ['equals', 'does not equal', 'greater than', 'starts with'];

class QueryStep extends Component {
    constructor(props) {

        super(props);

        this.state = {
            value: 0,
            prop: [],
            query: [],
            values: []
        };

        this.state.obj = this.props.obj || {
            value: '',
            property: '',
            query: 0
        }
    }

    deleteQuery = () => this.props.deleteQuery(this.props.index, this.props.ts);

    componentDidMount() {
        $('.query-list-item').click(function() {
            $(this).parent().siblings().text($(this).text());
        });

        this.props.handleQueryChange(this.state.obj.query, this.props.ts);
        this.props.handleValueChange(this.state.obj.value, this.props.ts);
        this.props.handlePropertyChange(this.state.obj.property, this.props.ts);

    }

    componentWillUnmount() {
        //this.props.deleteQuery(this.props.index, this.props.ts);
    }

    renderAllEventList() {
        if (this.props.eventsName) {
            return this.props.eventsName.map((eventName, i) => <option value={eventName} key={i}/>);
        }
    }

    renderAllQueryList() {
        return  allQuery.map((query, i) => {
            return {
                value: i,
                label: query,
                key: i
            };
        });
    }

    renderProperties() {
        const {properties} = this.props;
        return properties.map((property, i) => {
            return {
                value: property,
                label: property,
                key: i
            };
        })
    }

    handlePropertyChange(obj) {
        this.state.obj['property'] = obj.value;
        this.props.handlePropertyChange(obj.value, this.props.ts);
        this.setState(this.state);
    }

    handleQueryChange(obj) {
        this.state.obj['query'] = obj.value;
        this.state.value = this.state.obj['query'];
        this.props.handleQueryChange(obj.value, this.props.ts);
        this.setState(this.state);
    }

    handleValueChange(e) {
        this.state.obj['value'] = e.target.value;
        this.props.handleValueChange(e.target.value, this.props.ts);
        this.setState(this.state);
    }

    render() {

        const allQueryList = this.renderAllQueryList();
        return (

            <div key={this.props.ts} className={`fs-selection-row ${this.props.className}`}>
                <div key={this.props.ts}>

                    <Select value={this.state.obj['property']}
                            onChange={this.handlePropertyChange.bind(this)}
                            options={this.renderProperties()}
                            className={`filter-dd filter-property-dropdown ${'queryProperty' + this.props.ts}`}
                            placeholder="Select Property"
                            clearable={false} />

                    <Select value={this.state.value}
                            onChange={this.handleQueryChange.bind(this)}
                            options={allQueryList}
                            className="filter-dd filter-query-dropdown"
                            searchable={false}
                            clearable={false}/>

                    <input className="form-control fs-select-value"
                           value={this.state.obj['value']}
                           placeholder="Enter value"
                           type="text"
                           id={"queryValue" + this.props.ts}
                           onChange={this.handleValueChange.bind(this)}/>

                    {
                        this.props.parentComponent === "CreateFunnel" ?
                            <div style={{
                                verticalAlign: "middle",
                                marginBottom: 4,
                                border: "1px solid #bdc9d6",
                                alignItems: "center",
                                display: "inline-flex",
                                justifyContent: "center",
                                borderRadius: "50%",
                                boxShadow: "0 1px 1px 0 rgba(0,0,0,.2)",
                                width: 28,
                                height: 28,
                                marginLeft: 15,
                                backgroundColor:"white"
                            }}>
                                <LeftArrow color={blue500} onClick={this.deleteQuery.bind(this)}/>
                            </div>
                            :
                            <i className="ion ion-close-round query_close_icon cp"
                               onClick={this.deleteQuery.bind(this)}/>
                    }
                </div>
            </div>

        );
    }
}

function mapStateToProps(state) {
    const {events, eventsName, properties} = state.allEvents;
    return {events, eventsName, properties};
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(QueryStep);
