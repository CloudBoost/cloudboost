import React from 'react';
import planList from './plans';
import {paymentCountries} from './config';
import Popover from 'material-ui/Popover';
import ReactTooltip from 'react-tooltip';

class PlanDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openPlanSelector: false
        };
    }
    handleTouchTap = (event) => {
        event.preventDefault();
        this.setState({openPlanSelector: true, anchorEl: event.currentTarget})
    }

    handleRequestClose = () => {
        this.setState({openPlanSelector: false})
    }
    selectPlan(plan) {
        this.props.selectPlan(plan);
        this.handleRequestClose()
    }
    componentWillMount() {
        this.setState({selectedPlan: this.props.selectedPlan});
    }

    render() {
        return (
            <div className="plans">
                <div className="planname" onTouchTap={this.handleTouchTap}>
                    <span className="type">{this.props.selectedPlan.label}</span>
                    <span className="value">{this.props.selectedPlan.price || this.props.selectedPlan.price === 0
                            ? '$' + this.props.selectedPlan.price + ' ' + this.props.selectedPlan.priceDescription
                            : ''}</span>
                    <i className="icon ion-ios-arrow-down arrow"></i>
                </div>
                <Popover open={this.state.openPlanSelector} anchorEl={this.state.anchorEl} anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }} targetOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }} onRequestClose={this.handleRequestClose} className="plandetailsdropdown">
                    {planList.map((plan, i) => {
                        return <div className="plannamepop" key={i} onClick={this.selectPlan.bind(this, plan)}>
                            <span className="type">{plan.label}</span>
                            <span className="value">{plan.price || plan.price === 0
                                    ? '$' + plan.price + ' ' + plan.priceDescription
                                    : 'Custom'}</span>
                        </div>
                    })
}
                </Popover>
                <p className="divlabel">DATABASE</p>
                <div className="divdetail">
                    <span className="type">API Calls</span>
                    {this.props.selectedPlan.id === 3
                        ? <span className="value" data-tip="PAY AS YOU GO <br/><br/>$10 per GB of storage and $0.15 every 1000 API calls">{this.props.selectedPlan.usage[0].features[0].limit.label}</span>
                        : <span className="value" data-tip="">{this.props.selectedPlan.usage[0].features[0].limit.label}</span>}
                </div>
                <ReactTooltip place="top" multiline type="dark" delayShow={100}/>

                <div className="divdetail">
                    <span className="type">Storage</span>
                    {this.props.selectedPlan.id === 3
                        ? <span className="value" data-tip="PAY AS YOU GO <br/><br/>$10 per GB of storage and $0.15 every 1000 API calls">{this.props.selectedPlan.usage[0].features[0].limit.label}</span>
                        : <span className="value" data-tip="">{this.props.selectedPlan.usage[0].features[1].limit.label}</span>}
                </div>
                <p className="divlabel">REALTIME</p>
                <div className="divdetail">
                    <span className="type">Connections</span>
                    {this.props.selectedPlan.id === 3
                        ? <span className="value" data-tip="DATABASE CONNECTIONS <br/><br/>By default, we set a quota of 10,000 devices connecting to your database at the same time. You can request to have this limit lifted. See the FAQ below for details.">{this.props.selectedPlan.usage[0].features[0].limit.label}</span>
                        : <span className="value" data-tip="">{this.props.selectedPlan.usage[1].features[0].limit.label}</span>}
                </div>
                <p className="divlabel">MISC</p>
                <div className="divdetail">
                    <span className="type">MongoDB Access</span>
                    <span className={this.props.selectedPlan.usage[2].features[0].limit.show
                        ? 'value'
                        : 'value disabled'}>{this.props.selectedPlan.usage[2].features[0].limit.show
                            ? 'Available'
                            : 'Not Available'}</span>
                </div>
            </div>
        )
    }
}

export default PlanDetails
