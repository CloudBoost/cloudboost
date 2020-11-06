import React from 'react';
import planList from './plans';
import {paymentCountries} from './config';
import Popover from 'material-ui/Popover';

class PlanDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPlan: planList[0],
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
        this.setState({selectedPlan: plan})
        this.handleRequestClose()
    }

    render() {
        return (
            <div className="plans">
                <div className="planname" onTouchTap={this.handleTouchTap}>
                    <span className="type">{this.state.selectedPlan.label}</span>
                    <span className="value">{this.state.selectedPlan.price || this.state.selectedPlan.price === 0
                            ? '$ ' + this.state.selectedPlan.price
                            : ''}</span>
                    <i className="icon ion-ios-arrow-down arrow"></i>
                </div>
                <Popover open={this.state.openPlanSelector} anchorEl={this.state.anchorEl} anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }} targetOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }} onRequestClose={this.handleRequestClose}>
                    {planList.map((plan, i) => {
                        return <div className="plannamepop" key={i} onClick={this.selectPlan.bind(this, plan)}>
                            <span className="type">{plan.label}</span>
                            <span className="value">{plan.price || plan.price === 0
                                    ? '$ ' + plan.price
                                    : 'Custom'}</span>
                        </div>
                    })
}
                </Popover>
                <p className="divlabel">DATABASE</p>
                <div className="divdetail">
                    <span className="type">API Calls</span>
                    <span className="value">{this.state.selectedPlan.usage[0].features[0].limit.label}</span>
                </div>
                <div className="divdetail">
                    <span className="type">Storage</span>
                    <span className="value">{this.state.selectedPlan.usage[0].features[1].limit.label}</span>
                </div>
                <p className="divlabel">REALTIME</p>
                <div className="divdetail">
                    <span className="type">Connections</span>
                    <span className="value">{this.state.selectedPlan.usage[1].features[0].limit.label}</span>
                </div>
                <p className="divlabel">MISC</p>
                <div className="divdetail">
                    <span className="type">MongoDB Access</span>
                    <span className="value">{this.state.selectedPlan.usage[2].features[0].limit.show
                            ? 'Available'
                            : '-'}</span>
                </div>
            </div>
        )
    }
}

export default PlanDetails
