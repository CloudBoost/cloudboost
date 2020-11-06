import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import planList from './plans';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Modal, Button } from 'react-bootstrap';
import PlanDetails from './planDetails';

class SelectPlan extends React.Component {
  static propTypes = {
    appId: PropTypes.any,
    name: PropTypes.any,
    payment: PropTypes.any,
    paymentCallback: PropTypes.any,
    show: PropTypes.any,
    planId: PropTypes.any,
    close: PropTypes.any
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
      objCustomer: null,
      payments: []
    };
  }

  componentWillMount () {
    if (!__isDevelopment) {
      /** **Tracking*********/
      mixpanel.track('SelectPlan Plan', { 'App id': this.props.appId, 'App Name': this.props.name });
      /** **End of Tracking*****/
    }

    try {
      // if payment for new app , then select most expensive plan by default
      let selectedPlan = planList[4];
      this.setState({ selectedPlan: selectedPlan, currentPlan: selectedPlan });
    } catch (e) {
      console.log(e);
      this.setState({ selectedPlan: planList[0], currentPlan: planList[0] });
    }

    /** *******Get cards:begin*********/
    this.setState({
      customerId: this.props.payment.customerId,
      loading: false
    });

    /** *******Get cards:end*********/
  }

  purchase = () => {
    this.setState({ loading: true });
    let customerId = this.state.customerId;

    let planId = this.state.selectedPlan.id;

    let reqObj = {
      planId: planId,
      customer: {
        id: customerId
      }
    };

    if (this.props.paymentCallback) {
      this.props.paymentCallback(reqObj);
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

  toggleBilling (what) {
    this.setState({ billingToggled: what });
  }

  toggleAddcard (what) {
    this.setState({ addCardToggled: what });
  }

  addCardButton () {
    // commented to make billing address optional
    // if (this.validatecardDetails(true)) {
    this.toggleBilling(false);
    // }
  }

  billingChangeHandler (which, e) {
    this.state.cardDetails.billingAddr[which] = e.target.value;
    this.setState(this.state);
  }

  showError (which, show) {
    if (show) {
      $('.' + which).css('border', '1px solid #D60A00');
    } else { $('.' + which).css('border', 'none'); }
  }

  render () {
    return (
      <Modal show={this.props.show}
        bsSize={'medium'}
        backdrop={'static'}
        onHide={this.props.close}
        id='paymentModal'
        dialogClassName='payment-modal'>
        <Modal.Header bsClass={'select-plan-header'}>
          <span className='modal-title-style'> Select Plan </span>
          <i className='fa fa-cloud modal-icon-style pull-right' style={{ color: '#fff' }} />
          <div className='modal-title-inner-text'>
                                Select plan for the new app.
          </div>
        </Modal.Header>
        <Modal.Body>
          {
            this.state.loading === true &&
            <div className='cards'>
              <RefreshIndicator size={50}
                left={120}
                top={100}
                status='loading'
                className='loadermodal' />
            </div>
          }
          <div className='payment h-padding-15'>
            <PlanDetails planId={this.props.planId}
              selectPlan={this.selectPlan}
              currentPlan={this.state.currentPlan}
              selectedPlan={this.state.selectedPlan} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle='default'
            disabled={this.state.loading}
            id='cancelPurchaseBtn'
            onClick={!this.state.loading ? this.props.close : null}>
            <span> CANCEL </span>
          </Button>
          <Button
            bsStyle='success'
            disabled={this.state.loading}
            id='purchaseBtn'
            onClick={!this.state.loading ? this.purchase : null}>
            <i className={this.state.loading ? 'ion ion-refresh spin' : ''} />
            <span> PURCHASE PLAN </span>
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(null)(SelectPlan);
