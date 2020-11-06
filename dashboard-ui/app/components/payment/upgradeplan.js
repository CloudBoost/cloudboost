import React from 'react';
import PropTypes from 'prop-types';
import planList from './plans';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Modal, Button } from 'react-bootstrap';
import PlanDetails from './planDetails';
import { xhrDashBoardClient } from '../../xhrClient';
import { head } from 'lodash';
import { connect } from 'react-redux';
import { fetchApps, showAlert } from '../../actions';
import {
  Menu,
  MenuItem,
  Popover
} from 'material-ui';

class SelectPlan extends React.Component {
  static propTypes = {
    payments: PropTypes.any,
    planId: PropTypes.any,
    name: PropTypes.any,
    appId: PropTypes.any,
    dispatch: PropTypes.any,
    close: PropTypes.any,
    show: PropTypes.any,
    cancelPlanAtPeriodEnd: PropTypes.any,
    showCancel: PropTypes.any,
    disabled: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      loading: true,
      selectedPlan: planList[0],
      currentPlan: planList[0],
      payments: props.payments || [],
      objCustomer: null
    };
  }

  componentWillMount () {
    const { appId, name, planId } = this.props;
    if (!__isDevelopment) {
      /** **Tracking*********/
      mixpanel.track('ChangePlan Plan', { 'App id': appId, 'App Name': name });
      /** **End of Tracking*****/
    }

    try {
      const currentPlan = planList.find(plan => plan.id === planId);
      const selectedPlan = currentPlan || planList[4];
      this.setState({ selectedPlan, currentPlan });
    } catch (e) {
      this.setState({ selectedPlan: planList[0], currentPlan: planList[0] });
    }

    if (appId) {
      xhrDashBoardClient.get('/' + appId + '/customer')
        .then(response => {
          if (typeof response !== 'undefined' && typeof response.data !== 'undefined') {
            this.setState({
              loading: false,
              objCustomer: response.data
            });
          }
        })
        .catch(() => {
          this.setState({ loading: false });
        });
    }
  }

  purchase = () => {
    this.setState({ loading: true });
    const planId = this.state.selectedPlan.id;
    const source = head(this.state.objCustomer.sources.data);
    const { appId } = this.props;

    let reqObj = { customer: this.state.objCustomer, planId, source };

    xhrDashBoardClient
      .put('/' + appId + '/sale/plan', reqObj)
      .then(() => {
        this.setState({ loading: false });
        showAlert('success', 'Payment successful! Refreshing page!');
        this.props.dispatch(fetchApps());
        this.props.close();
      })
      .catch(() => {
        this.setState({ loading: false });
        showAlert('error', 'Server Error occurred, please try again!');
      });
  }

  resubscribe = () => {
    this.setState({ loading: true });
    const planId = this.state.selectedPlan.id;
    const { appId } = this.props;

    let reqObj = { planId, appId };

    xhrDashBoardClient
      .post('/' + appId + '/sale', reqObj)
      .then(() => {
        this.setState({ loading: false });
        showAlert('success', 'Payment successful! Refreshing page!');
        this.props.dispatch(fetchApps());
        this.props.close();
      })
      .catch(() => {
        this.setState({ loading: false });
        showAlert('error', 'Server Error occurred, please try again!');
      });
  }

  showPlanOptions = (event) => {
    this.setState({
      openCancelPlanOptions: true,
      anchorEl: event.currentTarget
    });
  }

  cancelPlan = () => {
    this.setState({ canceling: true, showCancelConfirm: true });
  }

  selectPlan = (plan) => {
    if (!__isDevelopment) {
      /** **Tracking*********/
      mixpanel.track('Selected Plan', { 'App id': this.props.appId, 'Plan Name': plan.label });
      /** **End of Tracking*****/
    }
    this.setState({ selectedPlan: plan });
  }

  handleRequestClose = () => {
    this.setState({
      openCancelPlanOptions: false
    });
  }

  render () {
    const { selectedPlan, currentPlan, loading, canceling } = this.state;
    const { cancelPlanAtPeriodEnd, disabled } = this.props;
    return (
      <Modal show={this.props.show}
        backdrop={'static'}
        id='paymentModal'
        dialogClassName='payment-modal'>
        <Modal.Header bsClass={'select-plan-header'}>
          <span className='modal-title-style'> Change Plan </span>
          <i className='fa fa-cloud modal-icon-style pull-right' style={{ color: '#fff' }} />
          {
            !cancelPlanAtPeriodEnd
              ? <div className='modal-title-inner-text'>
                                    Change plan
              </div>
              : <div className='modal-title-inner-text'>
                                    Plan to be cancelled after period end
              </div>
          }
        </Modal.Header>
        <Modal.Body>
          {
            loading === true &&
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
              currentPlan={currentPlan}
              selectedPlan={selectedPlan} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle='default'
            style={{ float: 'left' }}
            disabled={loading}
            onClick={!loading ? this.props.close : null}>
            <span> CANCEL </span>
          </Button>
          { disabled && <Button
            bsStyle='success'
            disabled={loading}
            onClick={!loading ? this.resubscribe : null}>
            <i className={loading ? 'fa fa-circle-o-notch fa-spin' : ''} />
            <span> PURCHASE PLAN </span>
          </Button> }
          { !disabled && <Button
            bsStyle='success'
            disabled={loading || currentPlan.id === selectedPlan.id}
            onClick={!loading ? this.purchase : null}>
            <i className={loading ? 'fa fa-circle-o-notch fa-spin' : ''} />
            <span> CHANGE PLAN </span>
          </Button> }
          {/* <CancelPlanOptions /> */}
          { !disabled && <Button
            bsStyle='danger'
            disabled={canceling || currentPlan.id !== selectedPlan.id}
            onClick={this.props.showCancel ? this.showPlanOptions : null}>
            <i className={canceling ? 'fa fa-circle-o-notch fa-spin' : ''} />
            <span> CANCEL PLAN </span>
          </Button> }
          <Popover
            open={this.state.openCancelPlanOptions}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            onRequestClose={this.handleRequestClose}
          >
            <Menu onItemTouchTap={this.handleRequestClose}>
              <MenuItem primaryText='Cancel immediately' onClick={() => this.props.showCancel('cancelImmediately')} />
              <MenuItem primaryText='Cancel after plan end' disabled={cancelPlanAtPeriodEnd} onClick={() => this.props.showCancel('cancelAfter')} />
            </Menu>
          </Popover>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(null)(SelectPlan);
