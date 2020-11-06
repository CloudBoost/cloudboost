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
    addCardButton() {
        this.props.addCardButton();
    }
    render() {
        let downgradePlan = this.props.selectedPlan.id < this.props.planId
        let selectPlanisSame = this.props.selectedPlan.id == this.props.planId

        return (
            <div>
                <div className={this.props.billingToggled && !selectPlanisSame
                    ? 'heading'
                    : 'hide'}>
                    <span className="main">Billing Address
                    </span>

                </div>
                <div className={this.props.billingToggled && !selectPlanisSame
                    ? 'billing'
                    : 'hide'}>
                    <div className="fields addrLine1">
                        <span className="labels">Address 1</span>
                        <input type="text" value={this.props.cardDetails.addrLine1} onChange={this.billingChangeHandler.bind(this, 'addrLine1')} placeholder="Street address 1" className="field" required/>
                    </div>
                    <div className="fields addrLine2">
                        <span className="labels">Address 2</span>
                        <input type="text" value={this.props.cardDetails.addrLine2} onChange={this.billingChangeHandler.bind(this, 'addrLine2')} placeholder="Street address 2" className="field"/>
                    </div>
                    <div className="fieldssmall city">
                        <span className="labels">City</span>
                        <input type="text" placeholder="City" value={this.props.cardDetails.city} onChange={this.billingChangeHandler.bind(this, 'city')} className="field" required/>
                    </div>
                    <div className="fieldssmall state">
                        <span className="labels">&nbsp;State</span>
                        <input type="text" placeholder="State" value={this.props.cardDetails.state} onChange={this.billingChangeHandler.bind(this, 'state')} className="field" required/>
                    </div>
                    <div className="fieldssmall zipcode">
                        <span className="labels">Zip</span>
                        <input type="text" placeholder="Zip Code" value={this.props.cardDetails.zipCode} onChange={this.billingChangeHandler.bind(this, 'zipCode')} className="field" required/>
                    </div>
                    <div className="fieldssmall country">
                        <span className="labels">&nbsp;&nbsp;Country</span>
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
                    <button className={"purchase"} onClick={this.addCardButton.bind(this)}>ADD CARD</button>
                    <button className={selectPlanisSame
                        ? "wide-button addcard"
                        : "addcard"} onClick={this.toggleBilling.bind(this, false)}>BACK</button>
                </div>
            </div>
        )
    }
}

export default Billing;
