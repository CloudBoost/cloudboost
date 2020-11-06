import React from 'react';
import PropTypes from 'prop-types';
import { showAlert, stripeCreateToken, testCard } from '../../actions';
import RefreshIndicator from 'material-ui/RefreshIndicator';

import {
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ButtonToolbar,
  Button
} from 'react-bootstrap';

import '../../styles/css/addCardForm.css';

let valid = require('card-validator');

class AddCardForm extends React.Component {
  static propTypes = {
    handleAbort: PropTypes.any,
    handleSubmit: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      isValidNumber: null,
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

    onSubmit = (e) => {
      e.preventDefault();

      this.setState({ loading: true });
      let reactComponent = this;
      const { cardDetails } = this.state;
      const { handleSubmit, handleAbort } = this.props;

      stripeCreateToken(cardDetails)
        .then(
          token => {
            let reqObj = {
              token: token.id
            };
            return testCard(reqObj);
          },
          err => {
            throw new Error(err.message);
          })
        .then(
          () => stripeCreateToken(cardDetails),
          (err) => {
            let message = err.data && err.data.error && err.data.error.message
              ? err.data.error.message
              : (err.data && err.data.message) || err.message || 'Error creating card';
            throw new Error(message);
          })
        .then(token => {
          let reqObj = {
            token: token.id,
            card: token.card
          };
          return handleSubmit(reqObj);
        })
        .then(() => {
          reactComponent.setState({ loading: false });
          showAlert('success', 'Added card payment successfully');
          handleAbort();
        },
        err => {
          let message = err.response && err.response.data ? err.response.data.message : err.message || 'Error creating card';
          throw new Error(message);
        })
        .catch(err => {
          reactComponent.setState({ loading: false });
          showAlert('error', err.message);
        });
    }

    cardDetailChangeHandler = (which) => (e) => {
      if (which === 'number') {
        if (e.target.value.replace(/ /g, '').length <= 16) {
          this.state.cardDetails[which] = e.target.value.replace(/ /g, '');
          const numberValidity = valid.number(this.state.cardDetails[which]);
          if (this.state.cardDetails[which] !== '') {
            this.state.isValidNumber = (numberValidity && numberValidity.isValid && 'success') || 'error';
          } else {
            this.state.isValidNumber = null;
          }

          this.state.cardDetails['displayNumber'] = this.formatCardNumber(e.target.value);
        }
      } else if (which === 'exp_month') {
        if (e.target.value.length < 2) { this.state.cardDetails[which] = e.target.value; } else if (e.target.value.length === 2 && valid.expirationMonth(e.target.value).isValid) { this.state.cardDetails[which] = e.target.value; }
      } else if (which === 'exp_year') {
        if (e.target.value.length < 4) { this.state.cardDetails[which] = e.target.value; } else if (e.target.value.length === 4 && valid.expirationYear(e.target.value).isValid) { this.state.cardDetails[which] = e.target.value; }
      } else if (which === 'cvv') {
        let cvv = this.state.cardDetails[which] = e.target.value;
        if (cvv !== '') {
          this.state.isValidCvv = (valid.cvv(cvv).isValid && 'success') || 'error';
        } else {
          this.state.isValidCvv = null;
        }
      } else {
        this.state.cardDetails[which] = e.target.value;
      }
      this.setState(this.state);
    }

    formatCardNumber = (number) => number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1  ').trim();

    getCardType (number) {
      if (number.length > 3) {
        let shnumber = number.split('-')[0];
        let card = valid.number(shnumber).card;
        return (card && card.type) || undefined;
      }
    }

    render () {
      const { cardDetails, isValidNumber, isValidCvv, loading } = this.state;
      const { handleAbort } = this.props;
      let cardType = this.getCardType(cardDetails.number);
      let cardImage = 'public/assets/images/' + cardType + '.png';

      return (
        <div className='AddCardForm'>
          <div className='AddCardForm__container'>
            {
              this.state.loading &&
              <div className='AddCardForm__container__loadingIndicator' >
                <RefreshIndicator size={45}
                  left={95}
                  top={65}
                  status='loading'
                  className='loadermodal' />
              </div>
            }
            <div className='AddCardForm__header'>
              <div className='AddCardForm__header__title'>Add Credit Card
                <i className='ion ion-card card-icon' />
              </div>
              <div className='AddCardForm__header__subtitle'>
                <strong>100%</strong>&nbsp; money back guarantee for the first 14 days on paid plans.
              </div>
            </div>

            <div className='AddCardForm__form'>
              <Form onSubmit={this.onSubmit}>

                <FormGroup controlId='cardName'>
                  <ControlLabel>Name</ControlLabel>
                  <FormControl
                    type='text'
                    autoComplete='cc-name'
                    onChange={this.cardDetailChangeHandler('name')}
                    placeholder='Card holder name.'
                    value={cardDetails.name || ''}
                    required
                  />
                </FormGroup>

                <FormGroup controlId='cardNumber' validationState={isValidNumber}>
                  <ControlLabel>Card No</ControlLabel>
                  <FormControl
                    type='text'
                    value={cardDetails.displayNumber || ''}
                    autoComplete='cc-number'
                    onChange={this.cardDetailChangeHandler('number')}
                    placeholder='1234 5678 9326 7352'
                    required
                  />
                  <FormControl.Feedback className='AddCardForm__form__cardTypeFeedback' >
                    {cardType && <img src={cardImage} />}
                  </FormControl.Feedback>
                </FormGroup>

                <div className='AddCardForm__form__row'>
                  <FormGroup controlId='cardMonth'>
                    <ControlLabel>Exp Month</ControlLabel>
                    <FormControl
                      type='text'
                      value={cardDetails.exp_month || ''}
                      autoComplete='cc-exp-month'
                      placeholder='MM'
                      onChange={this.cardDetailChangeHandler('exp_month')}
                      required
                    />
                  </FormGroup>
                  <FormGroup controlId='cardYear'>
                    <ControlLabel>Exp Year</ControlLabel>
                    <FormControl
                      type='text'
                      autoComplete='cc-exp-year'
                      placeholder='YYYY'
                      value={cardDetails.exp_year || ''}
                      onChange={this.cardDetailChangeHandler('exp_year')}
                      required
                    />
                  </FormGroup>
                  <FormGroup controlId='cardCVV' validationState={isValidCvv}>
                    <ControlLabel>CVV</ControlLabel>
                    <FormControl
                      type='text'
                      placeholder='CVV'
                      value={cardDetails.cvv || ''}
                      onChange={this.cardDetailChangeHandler('cvv')}
                      required
                    />
                  </FormGroup>
                </div>

                <ButtonToolbar >
                  <Button className='AddCardForm__form__addCardBtn' type='submit' disabled={loading}>ADD CARD</Button>
                  <Button className='AddCardForm__form__cancelBtn'onClick={() => handleAbort()}>CANCEL</Button>
                </ButtonToolbar>
              </Form>
            </div>
          </div>
        </div>
      );
    }
}

export default AddCardForm;
