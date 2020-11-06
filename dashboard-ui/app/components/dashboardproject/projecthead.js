import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { addApp, updateBeacon, showAlert, fetchUser } from '../../actions';
import { connect } from 'react-redux';
import Payment from '../payment';
import SelectPlan from '../payment/selectplan';
import _ from 'underscore';
import Loader from 'react-dots-loader';
import 'react-dots-loader/index.css';
import queryString from 'query-string';

const style = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    background: 'none',
    boxShadow: 'none',
    marginLeft: '18px',
    marginRight: '18px'
  }
};

export class Projecthead extends React.Component {
  static propTypes = {
    apps: PropTypes.any,
    dispatch: PropTypes.any,
    beacons: PropTypes.any,
    loading: PropTypes.any,
    payments: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      value: '',
      showPaymentModal: false
    };

    this.inputElementRef = null;
  }
    componentDidMount = () => {
      const parsed = queryString.parse(window.location.search);
      if (parsed.createApp === 'true') {
        this.setState({
          showModal: true
        });
      }
    }
    close = () => this.setState({ showModal: false, value: '' });

    open = () => this.setState({ showModal: true }, () => this.inputElementRef.focus());

    handleChange = (e) => this.setState({ value: e.target.value });

    handleKeyChange (e) {
      if (e.keyCode === 13) { this.createApp(); }
    }

    closeUpgradeModal = () => {
      this.setState({ showPaymentModal: false });
    }

    createApp = () => {
      let { value } = this.state;
      if (value) {
        let sameAppName = _.filter(this.props.apps, function (app) {
          return app.name.toLowerCase() === value.toLowerCase();
        });
        if (sameAppName.length === 0) {
          this.setState({ showPaymentModal: true });
        } else {
          (showAlert('error', 'App Name already exists.'));
        }
      }
    }

    paymentCallback = (paymentData) => {
      this.props.dispatch(addApp(this.state.value, paymentData)).then(() => {
        this.setState({ showModal: false, value: '', showPaymentModal: false });
        this.props.dispatch(updateBeacon(this.props.beacons, 'firstApp'));
        return paymentData.newUser ? this.props.dispatch(fetchUser()) : null;
      }, () => {
        showAlert('error', 'Error creating app.');
        this.setState({ showModal: false, value: '', showPaymentModal: false });
      });
    }

    render () {
      return (
        <div className='project-head'>
          <h1 className='dashboard-title pull-left' style={{ fontSize: '30px' }}>
                    Your Apps
          </h1>
          <div className='btn'
            onClick={this.open}>
            <span id='newApp'>+ New App</span>
          </div>
          <Modal
            className='small-height-modal'
            show={this.state.showModal} onHide={this.close}>
            <Modal.Header className='modal-header-style'>
              <Modal.Title>
                <span className='modal-title-style'> New App </span>
                <i className='fa fa-cloud modal-icon-style pull-right' />
                <div className='modal-title-inner-text'>
                                Create a new app.
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>

              <input ref={(c) => (this.inputElementRef = c)}
                value={this.state.value}
                id='createApp'
                placeholder='Pick a good name'
                onChange={this.handleChange}
                onKeyUp={this.handleKeyChange}
                required />
            </Modal.Body>
            <Modal.Footer>
              {
                this.props.loading
                  ? <Button className='btn-primary create-btn ' disabled>
                    <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
                  </Button>
                  : <Button
                    className='btn-primary create-btn'
                    onClick={this.createApp}>
                    <span
                      className='createAppBtnLabel' id='createAppBtn'>Create App</span>
                  </Button>
              }
            </Modal.Footer>
          </Modal>
          {
            (this.state.showPaymentModal && this.props.payments && !this.props.payments.length)
              ? <Payment
                appId={null}
                newApp
                planId={1}
                newUser
                show={this.state.showPaymentModal}
                close={this.closeUpgradeModal}
                paymentCallback={this.paymentCallback}
              /> : ''
          }

          {
            (this.state.showPaymentModal && this.props.payments && this.props.payments.length)
              ? <SelectPlan
                appId={null}
                newApp
                planId={1}
                show={this.state.showPaymentModal}
                close={this.closeUpgradeModal}
                payment={this.props.payments[0]}
                paymentCallback={this.paymentCallback}
              /> : ''
          }

        </div>
      );
    }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loader.modal_loading,
    beacons: state.beacons,
    payments: state.user.payments || [],
    apps: state.apps || []
  };
};

export default connect(mapStateToProps, null)(Projecthead);
