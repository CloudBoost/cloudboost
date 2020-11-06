import React from 'react';
import PropTypes from 'prop-types';

class Element extends React.Component {
  static propTypes = {
    cardDetailChangeHandler: PropTypes.any,
    billingChangeHandler: PropTypes.any,
    addCardButton: PropTypes.any,
    validatecardDetails: PropTypes.any,
    toggleAddcard: PropTypes.any,
    toggleBilling: PropTypes.any,
    appId: PropTypes.any,
    getCardType: PropTypes.any,
    addCardToggled: PropTypes.any,
    cardDetails: PropTypes.any,
    showBackBtn: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = { cardImage: '' };
  }

    cardDetailChangeHandler = (which) => (e) => this.props.cardDetailChangeHandler(which, e);

    billingChangeHandler = (which) => (e) => this.props.billingChangeHandler(which, e);

    addCardButton = () => this.props.addCardButton();

    toggleBilling = () => {
      if (this.props.validatecardDetails(false)) {
        this.props.toggleAddcard(false);
        this.props.toggleBilling(true);
      }
    }

    getCardType = (number) => {
      if (number.length > 3) { return this.props.getCardType(number); }
    }

    componentWillMount () {
      if (!__isDevelopment) { // eslint-disable-line
        /** **Tracking*********/
        mixpanel.track('Purchase Plan Btn', { 'App id': this.props.appId }); // eslint-disable-line
        /** **End of Tracking*****/
      }
    }

    render () {
      let cardImage = 'public/assets/images/' + this.getCardType(this.props.cardDetails.number) + '.png';
      let imageStyle = {
        background: 'url(' + cardImage + ')',
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundOrigin: 'content-box'
      };
      return (
        <div>
          {
            this.props.addCardToggled &&
            <div>
              <div>
                <div className='fields name'>
                  <span className='labels'>Name</span>
                  <input type='text'
                    autoComplete='cc-name'
                    value={this.props.cardDetails.billingAddr.name}
                    onChange={this.billingChangeHandler('name')}
                    id='cardName'
                    placeholder='Card holder name.' className='field' />
                </div>
                <div className=' fields number'>
                  <span className='labels fa fa-credit-card' />
                  <input type=' text'
                    autoComplete='cc-number'
                    value={this.props.cardDetails.displayNumber}
                    style={imageStyle}
                    onChange={this.cardDetailChangeHandler('number')}
                    placeholder='1234 5678 9326 7352'
                    id='cardNumber'
                    className='field cardnumber' />
                </div>

                <div className='fieldssmall month'>
                  <span className='labels'>Exp Month</span>
                  <input type='text'
                    autoComplete='cc-exp-month'
                    placeholder='MM'
                    value={this.props.cardDetails.expMonth}
                    id='cardMonth'
                    onChange={this.cardDetailChangeHandler('expMonth')}
                    className='field' />
                </div>

                <div className='fieldssmall year'>
                  <span className='labels'>Exp Year</span>
                  <input type='text'
                    autoComplete='cc-exp-year'
                    placeholder='YYYY'
                    value={this.props.cardDetails.expYear}
                    id='cardYear'
                    onChange={this.cardDetailChangeHandler('expYear')}
                    className='field' />
                </div>

              </div>
              <div className={this.props.addCardToggled ? 'buttons' : 'hide'}>
                <button
                  className={this.props.showBackBtn ? 'purchase btn-success' : 'purchase wide-button btn-success'}
                  onClick={this.toggleBilling}
                  id='cardPurchase'>
                                        NEXT
                </button>
                { this.props.showBackBtn &&
                <button className='addcard'
                  onClick={() => this.props.toggleAddcard(false)}
                  style={{ height: 41, width: '27%', marginLeft: 40 }}>
                                            BACK
                </button>
                }
              </div>
            </div>
          }
        </div>
      );
    }
}

export default Element;
