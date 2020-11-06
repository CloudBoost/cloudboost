import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import planList from './plans';
import { xhrDashBoardClient } from './xhrClient';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Modal } from 'react-bootstrap';
import PlanDetails from './planDetails';
import Addcard from './addcard';
import Billing from './billing';
import SelectCard from './selectcard';
import { showAlert, fetchApps } from '../../actions';
let valid = require('card-validator');

class Upgrade extends React.Component {
  static propTypes = {
    appId: PropTypes.any,
    name: PropTypes.any,
    newApp: PropTypes.any,
    planId: PropTypes.any,
    close: PropTypes.any,
    paymentCallback: PropTypes.any,
    dispatch: PropTypes.any,
    newUser: PropTypes.any,
    show: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      loading: true,
      selectedPlan: planList[0],
      currentPlan: planList[0],
      cardDetails: {
        number: '',
        expMonth: '',
        expYear: '',
        displayNumber: '',
        cvv: '',
        billingAddr: {
          name: '',
          addrLine1: '',
          addrLine2: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      },
      addCardToggled: true,
      billingToggled: false,
      error: null,
      openPlanSelector: false,
      objCustomer: null
    };
  }

  componentWillMount () {
    if (!__isDevelopment) {
      /** **Tracking*********/
      mixpanel.track('Upgrade Plan', { 'App id': this.props.appId, 'App Name': this.props.name });
      /** **End of Tracking*****/
    }

    try {
      let plan = planList.filter((currPlan) => {
        return currPlan.id === this.props.planId;
      });

      plan = plan[0] || planList[0];
      let selectedPlan = plan;

      // if payment for new app , then select most expensive plan by default
      console.log(this.props.newApp);
      if (this.props.newApp) {
        selectedPlan = planList[4];
      }
      this.setState({ selectedPlan: selectedPlan, currentPlan: plan });
    } catch (e) {
      console.log(e);
      this.setState({ selectedPlan: planList[0], currentPlan: planList[0] });
    }

    /** *******Get cards:begin*********/
    let reactComponent = this;
    if (this.props.appId) {
      xhrDashBoardClient.get('/' + this.props.appId + '/customer')
        .then(response => {
          if (typeof response !== 'undefined' && typeof response.data !== 'undefined') {
            reactComponent.setState({
              loading: false,
              addCardToggled: false,
              billingToggled: false,
              objCustomer: response.data
            });
          }
        })
        .catch(() => {
          // do nuffin
          reactComponent.setState({ loading: false });
        });
    } else {
      reactComponent.setState({
        loading: false
      });
    }

    /** *******Get cards:end*********/
  }

  purchase = (cardId) => {
    this.setState({ loading: true });
    let reactComponent = this;
    let appId = this.props.appId;

    let cardDetails = this.state.cardDetails;

    let planId = this.state.selectedPlan.id;

    // callback function fore new cards
    let stripeResponseHandler = (status, response) => {
      if (response.error) {
        reactComponent.setState({ loading: false });
        showAlert(response.error.message);
      } else {
        let reqObj = {
          token: response.id,
          billingAddr: cardDetails.billingAddr,
          planId: planId,
          newUser: this.props.newUser || false
        };

        if (this.state.objCustomer) { reqObj['customer'] = this.state.objCustomer; }

        if (this.props.paymentCallback) {
          this.props.paymentCallback(reqObj);
          return;
        }

        if (appId) {
          xhrDashBoardClient
            .post('/' + appId + '/sale', reqObj)
            .then(() => {
              reactComponent.setState({ loading: false });
              showAlert('success', 'Payment successful! Refreshing page!');
              this.props.dispatch(fetchApps());
              this.props.close();
            })
            .catch(() => {
              reactComponent.setState({ loading: false });
              showAlert('error', 'Server Error occurred, please try again!');
              this.props.close();
            });
        }
      }
    };

    if (cardId === 'new-card') {
      Stripe.createToken({
        name: this.state.cardDetails.billingAddr.name,
        number: this.state.cardDetails.number,
        exp_month: this.state.cardDetails.expMonth,
        exp_year: this.state.cardDetails.expYear,
        cvc: this.state.cardDetails.cvv
      }, stripeResponseHandler);
    } else {
      this.setState({ loading: true });
      let source = null;
      this.state.objCustomer.sources.data.forEach(card => {
        if (card.id === cardId) { source = card; }
      });

      let reqObj = { customer: this.state.objCustomer, planId: planId, source: source };
      if (this.props.paymentCallback) {
        this.props.paymentCallback(reqObj);
        return;
      }
      xhrDashBoardClient
        .post('/' + appId + '/sale', reqObj)
        .then(() => {
          reactComponent.setState({ loading: false });
          showAlert('success', 'Payment successful! Refreshing page!');
          this.props.dispatch(fetchApps());
          this.props.close();
        })
        .catch(() => {
          reactComponent.setState({ loading: false });
          showAlert('error', 'Server Error occurred, please try again!');
          this.props.close();
        });
    }
  }

  selectPlan = (plan) => {
    if (!__isDevelopment) {
      /** **Tracking*********/
      mixpanel.track('Selected Plan', { 'App id': this.props.appId, 'Plan Name': plan.label });
      /** **End of Tracking*****/
    }
    this.setState({ selectedPlan: plan });
  }

  goFree = () => {
    this.setState({ loading: true });
    let reactComponent = this;

    xhrDashBoardClient.delete('/' + this.props.appId + '/removecard')
      .then(() => {
        showAlert('success', 'Downgraded to free plan. Refreshing page!');
        this.props.dispatch(fetchApps());
        reactComponent.props.close();
        reactComponent.setState({ loading: false });
      })
      .catch(() => {
        reactComponent.setState({ loading: false });
        reactComponent.props.close();
        showAlert('error', 'Server Error occurred, please try again!');
      });
  }

  addCardButton = () => {
    // commented to make billing address optional
    // if (this.validatecardDetails(true)) {
    this.toggleBilling(false);
    // }
  }

  validatecardDetails = (isBilling) => {
    let reg = /^\d+$/;
    let { number, expMonth, expYear, billingAddr } = this.state.cardDetails;

    if (!billingAddr.name) {
      this.showError('name', true);
      return false;
    } else { this.showError('name', false); }

    if (!valid.number(number).isValid) {
      this.showError('number', true);
      return false;
    } else { this.showError('number', false); }

    if (!valid.expirationYear(expYear).isValid) {
      this.showError('year', true);
      return false;
    } else { this.showError('year', false); }

    if (!valid.expirationMonth(expMonth).isValid) {
      this.showError('month', true);
      return false;
    } else { this.showError('month', false); }

    if (isBilling) {
      if (!billingAddr.addrLine1) {
        this.showError('addrLine1', true);
        return false;
      } else { this.showError('addrLine1', false); }

      // address field 2 is optional.
      this.showError('addrLine2', false);

      if (!billingAddr.city) {
        this.showError('city', true);
        return false;
      } else { this.showError('city', false); }

      if (!billingAddr.state) {
        this.showError('state', true);
        return false;
      } else { this.showError('state', false); }

      if (!reg.test(billingAddr.zipCode)) {
        this.showError('zipcode', true);
        return false;
      } else { this.showError('zipcode', false); }

      if (!billingAddr.country) {
        this.showError('country', true);
        return false;
      } else { this.showError('country', false); }
    }
    return true;
  }

  toggleAddcard = (what) => {
    this.setState({ addCardToggled: what });
  }

  toggleBilling = (what) => {
    this.setState({ billingToggled: what });
  }

  cardDetailChangeHandler = (which, e) => {
    if (which === 'number') {
      if (e.target.value.replace(/ /g, '').length <= 16) {
        this.state.cardDetails[which] = e.target.value.replace(/ /g, '');
        this.state.cardDetails['displayNumber'] = this.formatCardNumber(e.target.value);
      }
    } else if (which === 'expMonth') {
      if (e.target.value.length < 2) { this.state.cardDetails[which] = e.target.value; } else if (e.target.value.length === 2 && valid.expirationMonth(e.target.value).isValid) { this.state.cardDetails[which] = e.target.value; }
    } else if (which === 'expYear') {
      if (e.target.value.length < 4) { this.state.cardDetails[which] = e.target.value; } else if (e.target.value.length === 4 && valid.expirationYear(e.target.value).isValid) { this.state.cardDetails[which] = e.target.value; }
    } else {
      this.state.cardDetails[which] = e.target.value;
    }
    this.setState(this.state);
  }

    formatCardNumber = (number) => number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1  ').trim();

    billingChangeHandler = (which, e) => {
      this.state.cardDetails.billingAddr[which] = e.target.value;
      this.setState(this.state);
    }

    showError = (which, show) => {
      if (show) {
        $('.' + which).css('border', '1px solid #D60A00');
      } else { $('.' + which).css('border', 'none'); }
    }

    getCardType = (number) => {
      try {
        number = number.split('-')[0];
        let card = valid.number(number).card;
        return card.type;
      } catch (e) {
        console.log('card no. not entered');
      }
    }

    render () {
      let selectPlanisSame = this.state.selectedPlan.id === this.props.planId;
      let downgradePlan = this.state.selectedPlan.priority < this.state.currentPlan.priority;
      let downgradeToFreePlan = this.state.selectedPlan.id === 1 && this.state.currentPlan.priority > 1;

      return (
        <Modal show={this.props.show}
          bsSize={'large'}
          onHide={this.props.close}
          id='paymentModal'
          dialogClassName='payment-modal'>
          <Modal.Body>
            <div className='payment'>
              {
                this.state.loading === true
                  ? <div className='cards'>
                    <RefreshIndicator size={30}
                      left={70}
                      top={0}
                      status='loading'
                      className='loadermodal' />
                  </div>
                  : <div className='cards'>
                    <div className={this.state.billingToggled ? 'hide' : 'heading'}>
                      <span className='main'>Payment Information
                        <i className='ion ion-card card-icon' />
                      </span>
                      <span className='sub'>
                        <strong>100%</strong>&nbsp; money back guarantee for the first 14 days on paid plans.
                      </span>
                    </div>

                    {
                      (this.state.cardDetails.number !== '' || this.state.objCustomer !== null) &&
                      <SelectCard selectedPlan={this.state.selectedPlan}
                        cardDetails={this.state.cardDetails}
                        planId={this.props.planId}
                        addCardToggled={this.state.addCardToggled}
                        billingToggled={this.state.billingToggled}
                        objCustomer={this.state.objCustomer}
                        downgradePlan={downgradePlan}
                        goFree={this.goFree}
                        purchase={this.purchase}
                        getCardType={this.getCardType}
                        toggleAddcard={this.toggleAddcard}
                        toggleBilling={this.toggleBilling}
                        cardDetailChangeHandler={this.cardDetailChangeHandler}
                        currentPlan={this.state.currentPlan}
                      />
                    }
                    {
                      !selectPlanisSame && !downgradeToFreePlan &&
                        <Addcard getCardType={this.getCardType}
                          validatecardDetails={this.validatecardDetails}
                          toggleBilling={this.toggleBilling}
                          showBackBtn={this.state.objCustomer !== null}
                          addCardToggled={this.state.addCardToggled}
                          cardDetails={this.state.cardDetails}
                          cardDetailChangeHandler={this.cardDetailChangeHandler}
                          billingChangeHandler={this.billingChangeHandler}
                          addCardButton={this.addCardButton}
                          toggleAddcard={this.toggleAddcard}
                          currentPlan={this.state.currentPlan}
                          appId={this.props.appId} />
                    }

                    <Billing addCardButton={this.addCardButton}
                      planId={this.props.planId}
                      billingToggled={this.state.billingToggled}
                      cardDetails={this.state.cardDetails}
                      billingChangeHandler={this.billingChangeHandler}
                      toggleBilling={this.toggleBilling}
                      toggleAddcard={this.toggleAddcard}
                      currentPlan={this.state.currentPlan}
                      selectedPlan={this.state.selectedPlan} />
                  </div>
              }
              <PlanDetails planId={this.props.planId}
                selectPlan={this.selectPlan}
                currentPlan={this.state.currentPlan}
                selectedPlan={this.state.selectedPlan} />
            </div>
          </Modal.Body>
        </Modal>
      );
    }
}

export default connect(null)(Upgrade);
