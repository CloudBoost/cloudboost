import React, { Component } from 'react'
import { find, first } from 'lodash';
import Card from './payment/card'
import App from './payment/app'
import FormFooter from './formFooter'

import plans from '../../config/plans'

export default class Payment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toggleApp: true,
      togglePaymentForm: false,
      toggleCompanyForm: false,
      errorMessage: "",
      isCardCharged: false,
      progress: false,
      cardDetails: {},
      appDetails: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.togglePaymentForm !== nextProps.togglePaymentForm) {
      this.setState({ togglePaymentForm: nextProps.togglePaymentForm });
    }

    if (this.state.toggleApp !== nextProps.toggleApp) {
      this.setState({ toggleApp: nextProps.toggleApp });
    }

    if (this.state.isCardCharged !== nextProps.isCardCharged) {
      this.setState({ isCardCharged: nextProps.isCardCharged });
    }
  }

  getPlan(planId) {
    return find(plans, { id: planId });
  }

  getAppDetails(appDetails) {
    this.state.toggleApp = appDetails.toggleApp
    this.state.appDetails = appDetails
    this.state.errorMessage = appDetails.errorMessage
    this.setState(this.state)
  }

  getCardDetails(cardDetails) {
    this.state.toggleCompanyForm = cardDetails.toggleCompanyForm
    this.state.togglePaymentForm = cardDetails.togglePaymentForm
    this.state.toggleApp = cardDetails.toggleApp;
    this.state.cardDetails = cardDetails
    this.state.isCardCharged = cardDetails.isCardCharged
    this.state.errorMessage = cardDetails.errorMessage
    this.setState(this.state)
    this.props.setPaymentDetails(this.state)
  }

  setCardProgress(which) {
    this.props.setCardProgress(which);
  }

  render() {

    let boxClassName = "";
    let btnClassName = "loginbtn floatingBtn ";
    let annualBilling = true;
    let isProPlus = false;
    var plan = this.getPlan(this.props.planId);
    var label = plan.label

    if (plan.type == 'month') {
      annualBilling = false;
    }

    if (label && label.includes("Basic")) {
      boxClassName = "basicBox columnLeft";
      btnClassName = btnClassName + "basicBoxBtn";
    }

    if (label && label.includes("Pro")) {
      boxClassName = "proBox columnLeft";
      btnClassName = btnClassName + "proBoxBtn";
    }

    if (label && label.includes("Pro+")) {
      boxClassName = "proPlusBox columnLeft";
      btnClassName = btnClassName + "proPlusBoxBtn";
    }

    var usage = plan.usage.map((text) => "<br /> " + text);

    return (

      <div>
        <div className={this.props.togglePaymentForm ? 'paymentBoxContainer' : 'hide'}>
          <div className="paymentBox">
            <div className={boxClassName}>
              <div className="planBoxCap">
                <h4 className="planBoxTitle plan__title ">{plan.label}</h4>
                <p className="plabBoxDesc plan__summary">{plan.planDescription}</p>
                <div className="planPrice">
                  <div className="superscript">$</div>
                  <span>{this.getPlan(this.props.planId).price}</span>
                  <div className="subscript">/mo {annualBilling &&<span className="billingStatus">*Billed anually</span>}</div>
                </div>
              </div>
              <div className="plan__overview" dangerouslySetInnerHTML={{ __html: usage }}>
              
              </div>
              <div className="plan__description">
                 {plan.moreInfo}
               </div>
            </div>
            <div className="columnRight">
              <App btnClassName = {btnClassName} toggleApp={this.state.toggleApp} setAppDetails={this.getAppDetails.bind(this)} />
              <Card btnClassName = {btnClassName} setCardProgress = {this.setCardProgress.bind(this)} toggleApp={this.state.toggleApp} annual={this.props.annual} togglePaymentForm={this.state.togglePaymentForm} isCardCharged={this.state.isCardCharged} setCardDetails={this.getCardDetails.bind(this)} />
            </div>
          </div>
        </div>
      </div>
        
    )
  }
}
