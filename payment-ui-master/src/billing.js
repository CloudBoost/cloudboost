import React from 'react';
import planList from './plans';
import {paymentCountries} from './config';

class Billing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPlan: planList[0]
        };
    }
    billingChangeHandler(which, e) {
        this.props.billingChangeHandler(which, e);
    }
    toggleBilling(value) {
        this.props.toggleBilling(value);
    }
    purchase(e) {
        this.props.purchase(e);
    }
    render() {
        let downgradePlan = this.state.selectedPlan.id < this.props.planId
        return (
            <form onSubmit={this.purchase.bind(this)}>
                <div className={this.props.billingToggled
                    ? 'billing'
                    : 'hide'}>
                    <div className="fields">
                        <span className="labels">Addr3</span>
                        <input type="text" value={this.props.cardDetails.addrLine1} onChange={this.billingChangeHandler.bind(this, 'addrLine1')} placeholder="Street address 1" className="field" required/>
                    </div>
                    <div className="fields">
                        <span className="labels">Addr2</span>
                        <input type="text" value={this.props.cardDetails.addrLine2} onChange={this.billingChangeHandler.bind(this, 'addrLine2')} placeholder="Street address 2" className="field"/>
                    </div>
                    <div className="fieldssmall">
                        <span className="labels">City</span>
                        <input type="text" placeholder="City" value={this.props.cardDetails.city} onChange={this.billingChangeHandler.bind(this, 'city')} className="field" required/>
                    </div>
                    <div className="fieldssmall">
                        <span className="labels">State</span>
                        <input type="text" placeholder="State" value={this.props.cardDetails.state} onChange={this.billingChangeHandler.bind(this, 'state')} className="field" required/>
                    </div>
                    <div className="fieldssmall">
                        <span className="labels">Zip</span>
                        <input type="text" placeholder="Zipcode" value={this.props.cardDetails.zipCode} onChange={this.billingChangeHandler.bind(this, 'zipCode')} className="field" required/>
                    </div>
                    <div className="fieldssmall">
                        <span className="labels">Country</span>
                        <select className="field" value={this.props.cardDetails.country} onChange={this.billingChangeHandler.bind(this, 'country')} required>
                            <option value="">Select</option>
                            {paymentCountries.map((country, i) => {
                                return <option value={country.code} key={i}>{country.label}</option>
                            })
}
                        </select>
                    </div>
                </div>
                <div className={this.props.billingToggled
                    ? 'buttons'
                    : 'hide'}>
                    <button className="purchase" type="submit">{downgradePlan
                            ? "DOWNGRADE PLAN"
                            : "PURCHASE PLAN"}</button>
                    <button className="addcard" onClick={this.toggleBilling.bind(this, false)}>BACK</button>
                </div>
            </form>
        )
    }
}

export default Billing;
