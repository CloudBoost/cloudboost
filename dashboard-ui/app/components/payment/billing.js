import React from 'react';
import PropTypes from 'prop-types';
import planList from './plans';
import { paymentCountries } from './config';

class Billing extends React.Component {
  static propTypes = {
    billingChangeHandler: PropTypes.any,
    toggleAddcard: PropTypes.any,
    toggleBilling: PropTypes.any,
    selectedPlan: PropTypes.any,
    planId: PropTypes.any,
    billingToggled: PropTypes.any,
    cardDetails: PropTypes.any,
    addCardButton: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = { selectedPlan: planList[0] };
  }

    billingChangeHandler = (which) => (e) => this.props.billingChangeHandler(which, e);

    onBackClick = () => {
      this.props.toggleBilling(false);
      this.props.toggleAddcard(true);
    };

    render () {
      // let downgradePlan = this.props.selectedPlan.id < this.props.planId;
      let selectPlanisSame = this.props.selectedPlan.id === this.props.planId;
      let downgradeToFreePlan = this.props.selectedPlan.id === 1 && this.props.planId > 1;

      return (
        <div className={this.props.billingToggled && !selectPlanisSame && !downgradeToFreePlan ? '' : 'hide'}>
          <div className='heading'>
            <span className='main'>Billing Address (Optional)</span>
          </div>
          <div className='billing'>
            <div className='fields addrLine1'>
              <span className='labels'>Address 1</span>
              <input type='text'
                value={this.props.cardDetails.addrLine1}
                onChange={this.billingChangeHandler('addrLine1')}
                placeholder='Street address 1'
                className='field'
                id='streetAdd1'
                required />
            </div>
            <div className='fields addrLine2'>
              <span className='labels'>Address 2</span>
              <input type='text'
                value={this.props.cardDetails.addrLine2}
                onChange={this.billingChangeHandler('addrLine2')}
                placeholder='Street address 2'
                className='field' />
            </div>
            <div className='fieldssmall city'>
              <span className='labels'>City</span>
              <input type='text'
                placeholder='City'
                value={this.props.cardDetails.city}
                onChange={this.billingChangeHandler('city')}
                className='field'
                required />
            </div>
            <div className='fieldssmall state'>
              <span className='labels'>&nbsp;State</span>
              <input type='text'
                placeholder='State'
                value={this.props.cardDetails.state}
                onChange={this.billingChangeHandler('state')}
                className='field'
                required />
            </div>
            <div className='fieldssmall zipcode'>
              <span className='labels'>Zip</span>
              <input type='text'
                placeholder='Zip Code'
                value={this.props.cardDetails.zipCode}
                onChange={this.billingChangeHandler('zipCode')}
                className='field'
                required />
            </div>
            <div className='fieldssmall country'>
              <span className='labels'>&nbsp;&nbsp;Country</span>
              <select className='field'
                value={this.props.cardDetails.country}
                onChange={this.billingChangeHandler('country')}
                required>
                <option value=''>Select</option>
                { paymentCountries.map((country, i) => <option value={country.code} key={i}>  {country.label}  </option>) }
              </select>
            </div>
          </div>
          <div className={this.props.billingToggled ? 'buttons' : 'hide'}>
            <button id='nextBtnAdd' className={'purchase btn-success'} onClick={this.props.addCardButton}>NEXT</button>
            <button className={selectPlanisSame ? 'wide-button addcard' : 'addcard'}
              onClick={this.onBackClick}
              style={{ height: 41, width: '27%', marginLeft: 40 }}>
                        BACK
            </button>
          </div>
        </div>
      );
    }
}

export default Billing;
