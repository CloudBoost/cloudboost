import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import QueryStep from '../../elements/queryStep.js';
import {fetchEventsPageWise} from '../../actions/index';
import LiveViewTable from './table'
import {RefreshIndicator} from 'material-ui';
import MenuItem from 'material-ui/MenuItem';
import FilterModal from './filterModal';

const styles = {

    refresh: {
        display: 'inline-block',
        position: 'relative',
        background: 'none',
        boxShadow: 'none',
        marginTop: '5%',
        marginLeft: '50%'
    }
};

class LiveView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            queryArr: [],
            queryStepCount: 0,
            value: 0
        };
    }

    addQueryStep() {
        this.state.queryStepCount++;
        let arr = this.state.queryArr;
        arr.push(<QueryStep index={this.state.queryStepCount - 1} deleteQuery={this.deleteQueryStep.bind(this)} ts={Date.now()}/>);
        this.state.queryArr = arr;
        this.setState(this.state);
    }

    deleteQueryStep(index) {
        this.state.queryArr = this.state.queryArr.filter((element) => {
            return (element.props.index !== index)
        });
        this.state.queryStepCount--;
        this.setState(this.state);

    }
    openModal() {
        this.state.showModal = true;
        this.setState(this.state);
    }

    closeModal() {
        this.state.showModal = false;
        this.setState(this.state);
    }
    //for infinite scrolling
    handleScroll(scroll) {
        let {scrollTop, scrollHeight} = scroll.target.body;
        if (scrollTop > (scrollHeight - window.innerHeight) * 0.75) {
            if (!this.props.loading && this.props.currentPage < this.props.totalPages)
                this.props.fetchEventsPageWise({
                    currentPage: this.props.currentPage + 1
                })
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
    renderAllEventList() {
        if (this.props.eventsName) {
            let allEvents = ((this.props.eventsName)).map((eventName, i) => {
                return (<MenuItem value={i} key={i} primaryText={eventName}/>);
            });
            return allEvents;
        }
    }
    handleChange = (event, index, value) => this.setState({value});
    filterEvents(data) {
        let {event, obj, addEventFilter} = data;
        this.props.fetchEventsPageWise({currentPage: 1, filterEvents: true, event, obj, addEventFilter})
    }

    render() {

        const options = {
            noDataText: 'No Events Found!!',
            onlyOneExpanding: true
        }
        const allEventList = this.renderAllEventList();

        const allEvents = this.props.events || [];
        return (
            <div class="liveview">
                <div className="liveview_header_wrapper">
                    <div className="liveview_header">
                        <div className="filter_button" onClick={this.openModal.bind(this)}>
                            <svg id="filter-funnel" viewBox="0 0 36 36" width="100%" height="100%">
                                <path d="M28.9,8.6C28.8,8.2,28.4,8,28,8H8C7.6,8,7.2,8.2,7.1,8.6C6.9,8.9,7,9.4,7.3,9.7l3.8,4.2c0-0.8,0.5-1.4,1.2-1.7L10.2,10h15.5l-6.5,7.3C19.1,17.5,19,17.8,19,18v4.6l-2,2v-5.9c-0.3,0.2-0.6,0.3-1,0.3h-1v1v7c0,0.4,0.2,0.8,0.6,0.9C15.7,28,15.9,28,16,28c0.3,0,0.5-0.1,0.7-0.3l4-4c0.2-0.2,0.3-0.4,0.3-0.7v-4.6l7.7-8.7C29,9.4,29.1,8.9,28.9,8.6z"></path>
                                <path d="M16,18c0.4,0,0.7-0.2,0.8-0.5c0.1-0.1,0.2-0.3,0.2-0.5c0-0.6-0.4-1-1-1h-0.4H15h-1v-1v-0.8V14c0-0.6-0.4-1-1-1c0,0-0.1,0-0.1,0c-0.5,0-0.9,0.5-0.9,1v1v0v1h-1h-1c-0.6,0-1,0.4-1,1s0.4,1,1,1h1h1v1v1c0,0.6,0.4,1,1,1s1-0.4,1-1v-1v-1h0.7H15H16z"></path>
                            </svg>
                            <span className="text">Filter</span>
                        </div>
                        <div className="searchbox_container">
                            <svg id="spyglass" viewBox="0 0 12 12" width="100%" height="100%">
                                <path d="M11.7,11.6c-0.4,0.4-1.1,0.4-1.6,0l-2-2c-0.9,0.5-1.8,0.9-2.8,0.9C2.3,10.5,0,8.1,0,5.3C0,2.4,2.4,0,5.2,0c2.9,0,5.2,2.4,5.2,5.2c0,1-0.3,2-0.9,2.8l2,2C12.1,10.5,12.1,11.2,11.7,11.6z M5.2,1.5c-2.1,0-3.8,1.7-3.8,3.8s1.7,3.8,3.8,3.8S9,7.3,9,5.3C9,3.1,7.4,1.5,5.2,1.5z"></path>
                            </svg>
                            <input type="text" placeholder="Search" className="tableSearchBox" spellCheck="false"/>
                        </div>
                    </div>
                </div>
                <div class="liveview-table-div">
                    <LiveViewTable/>
                    {
                        this.props.loading &&
                        <RefreshIndicator loadingColor="#549afc"
                                          size={40}
                                          left={0}
                                          top={0}
                                          status="loading"
                                          style={styles.refresh}/>
                    }
                </div>
                <FilterModal show={this.state.showModal} close={this.closeModal.bind(this)} filterEvents={this.filterEvents.bind(this)}/>

            </div>

        );
    }

}
function mapStateToProps(state) {
    const {events, currentPage, totalPages, eventsName} = state.eventsPage;
    const {filterEvents, event, obj, addEventFilter} = state.filter
    const {loading} = state.loader

    return {
        events,
        loading,
        currentPage,
        totalPages,
        eventsName,
        filterEvents,
        event,
        obj,
        addEventFilter
    };
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchEventsPageWise
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(LiveView);
