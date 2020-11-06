import React from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';

var valid = require('card-validator');

class SelectCard extends React.Component {
  static propTypes = {
    cardDetails: PropTypes.any,
    objCustomer: PropTypes.any,
    purchase: PropTypes.any,
    cardDetailChangeHandler: PropTypes.any,
    selectedPlan: PropTypes.any,
    currentPlan: PropTypes.any,
    planId: PropTypes.any,
    addCardToggled: PropTypes.any,
    billingToggled: PropTypes.any,
    getCardType: PropTypes.any,
    goFree: PropTypes.any,
    toggleAddcard: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      open: false,
      disablePurchaseButton: false,
      selectedCardId: props.cardDetails.number === '' ? props.objCustomer.sources.data[0].id : 'new-card'
    };
  }

    componentWillReceiveProps = newProps => this.setState({
      selectedCardId: newProps.cardDetails.number === '' ? newProps.objCustomer.sources.data[0].id : 'new-card'
    });

    purchaseButton = () => {
      if (this.state.selectedCardId === 'new-card') {
        let cvv = this.props.cardDetails.cvv;
        if (this.props.cardDetails.cvv && valid.cvv(cvv).isValid) {
          $(this.refs[this.state.selectedCardId + '-cvv']).css('border', 'none');
          this.setState({ disablePurchaseButton: true }, () => this.props.purchase(this.state.selectedCardId));
        } else {
          $(this.refs[this.state.selectedCardId + '-cvv']).css('border', '2px solid red');
        }
      } else {
        this.setState({ disablePurchaseButton: true }, () => this.props.purchase(this.state.selectedCardId));
      }
    }

    onSelectCard = (ref) => {
      $('.cardadded').css('border', 'none');
      $(this.refs[ref]).css('border', '1px solid #4A8BFA');
      this.setState({ selectedCardId: ref });
    }

    handleKeyChange = (e) => {
      if (e.keyCode === 13) { this.purchaseButton(); } else { this.props.cardDetailChangeHandler('cvv', e); }
    }

    handleRequestClose = () => this.setState({ open: false });

    render () {
      let selectPlanisSame = this.props.selectedPlan.id === this.props.planId;
      let downgradePlan = this.props.selectedPlan.priority < this.props.currentPlan.priority;
      let downgradeToFreePlan = this.props.selectedPlan.id === 1 && this.props.currentPlan.priority > 1;

      let getCardImageName = (cardType) => {
        cardType = cardType.toLowerCase();

        if (cardType === 'mastercard') cardType = 'master-card';
        else if (cardType === 'american express') cardType = 'american-express';
        else if (cardType === 'diners club') cardType = 'diners-club';

        return cardType;
      };

      return (
        <div>
          {
            !this.props.addCardToggled &&
                    !this.props.billingToggled &&
                    !selectPlanisSame &&
                    !downgradeToFreePlan &&
                    <Scrollbars className='cardDiv'>
                      {
                        this.props.cardDetails.number !== '' && // new Card
                          <div ref={'new-card'}
                            className='cardadded'
                            style={{ border: this.state.selectedCardId === 'new-card' ? '1px solid #4A8BFA' : 'none' }}
                            onClick={() => this.onSelectCard('new-card')}
                          >
                            <img
                              src={'public/assets/images/' + this.props.getCardType(this.props.cardDetails.number) + '.png'}
                              className='cardimage' />
                            <span
                              className='cardnumber'>{'xxxx-xxxx-xxxx-' + this.props.cardDetails.displayNumber.split('  ')[3]}</span>
                            <input type='text'
                              className='cardcvv'
                              autoComplete='cc-csc'
                              placeholder='CVV'
                              id='cardCVV'
                              onKeyUp={this.handleKeyChange}
                              ref={'new-card-cvv'} />
                          </div>
                      }
                      {
                        this.props.objCustomer !== null &&
                            this.props.objCustomer.sources.data.map(card => {
                              return <div key={card.id}
                                ref={card.id}
                                className='cardadded'
                                style={{ border: this.state.selectedCardId === card.id ? '1px solid #4A8BFA' : 'none' }}
                                onClick={() => this.onSelectCard(card.id)}>
                                <img src={'public/assets/images/' + getCardImageName(card.brand) + '.png'}
                                  className='cardimage' />
                                <span
                                  className='cardnumber'>{'xxxx-xxxx-xxxx-' + card.last4}</span>
                                {
                                  card.cvc_check !== 'pass' &&
                                  <input type='text'
                                    className='cardcvv'
                                    autoComplete='cc-csc'
                                    placeholder='CVV'
                                    onKeyUp={this.handleKeyChange}
                                    ref={card.id + '-cvv'} />
                                }
                              </div>;
                            })
                      }
                    </Scrollbars>
          }
          <div
            className={(this.props.addCardToggled || this.props.billingToggled || selectPlanisSame || downgradeToFreePlan) ? 'hide' : 'buttons'}>
            <button className={downgradePlan ? 'downgrade btn btn-danger' : 'purchase btn btn-success'}
              onClick={this.purchaseButton}
              id='planPayment'
              disabled={this.state.disablePurchaseButton}>
              {downgradePlan ? 'DOWNGRADE PLAN' : 'PURCHASE PLAN'}
            </button>
            <button className='addcard'
              onClick={() => this.props.toggleAddcard(true)}
              style={{ height: 41, width: '27%', marginLeft: 40 }}>
                        ADD CARD
            </button>
          </div>
          <div className={downgradeToFreePlan ? 'buttons' : 'hide'}>
            <button className='purchase btn btn-danger wide-button'
              onClick={this.props.goFree}
              disabled={this.state.disablePurchaseButton}>
                        DOWNGRADE PLAN
            </button>
          </div>
          <div className={selectPlanisSame ? '' : 'hide'}>
            <div style={{ padding: 68, textAlign: 'center' }}>
              <i className='fa fa-thumbs-o-up cardnotfound' aria-hidden='true' />
              <p className='addacardmessage'>You are already on this plan.</p>
            </div>
          </div>
          <div className={downgradeToFreePlan ? '' : 'hide'}>
            <div style={{ padding: 68, textAlign: 'center' }}>
              <i className='fa fa-thumbs-o-down cardnotfound' aria-hidden='true' />
              <p className='addacardmessage'>Going back to Free Plan</p>
            </div>
          </div>
        </div>
      );
    }
}

export default SelectCard;
