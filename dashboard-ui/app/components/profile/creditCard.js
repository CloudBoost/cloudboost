import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CardItem extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showOptions: false
    };
  }

  getBrandSpecificStyles = (brandName) => {
    // From stripe API normally we recive brandname as one of below values.
    // ====> American Express, Diners Club, Discover, JCB, MasterCard, UnionPay, Visa, or Unknown.

    // Removing spaces and lowercasing for unified names;
    const formattedBrandName = brandName.replace(' ', '').toLowerCase();

    const brandImages = {
      visa: 'visa.png',
      mastercard: 'master-card.png',
      americanexpress: 'american-express.png',
      discover: 'discover.png',
      dinersclub: 'diners-club.png',
      jcb: 'jcb.png',
      unionpay: 'union-pay.png',
      unknown: 'unknown-card.png'
    };

    return {
      brandImageURL: `url(/public/assets/images/${brandImages[formattedBrandName]})`
    };
  }

  handleOptionsBox = (showOptionsState) => {
    this.setState({
      showOptions: showOptionsState
    });
  }

  render () {
    const { card, editButtonFn, deleteButtonFn, disableDelete } = this.props;
    const { showOptions } = this.state;
    const brandSpecificStyles = this.getBrandSpecificStyles(card.brand);

    return (
      <div className='cardItem'>
        <div
          className={`cardItem__creditCard`}
          onMouseEnter={() => this.handleOptionsBox(true)}
          onMouseLeave={() => this.handleOptionsBox(false)}
        >
          <div className='cardItem__creditCard__card'>
            <div
              className='creditCard__brandLogo'
              style={{ backgroundImage: brandSpecificStyles.brandImageURL }}
            />
            <div className='creditCard__number'>
              XXXX-XXXX-XXXX-{card.last4}
            </div>
            <div className='creditCard__name'> {card.name || 'Name'} </div>

            <div className='creditCard__exp'>
              <div className='creditCard__exp__value'>
                {card.exp_month}/{card.exp_year}
              </div>
            </div>
          </div>

          {showOptions && (
            <div className='cardItem__creditCard_options'>
              {/* For now "Removing A Card" function is hidden from user */ }
              <button
                className={`creditCard_option__deleteBtn ${disableDelete ? 'creditCard_option__deleteBtn--disabled' : ''}`}
                disabled={disableDelete}
                onClick={deleteButtonFn}
                style={{ display: 'none' }}
              >
                <div title='Remove This Card'><i className='ion ion-close' /> Remove</div>
              </button>
              <button
                className='creditCard_option__editBtn'
                onClick={editButtonFn}
              >
                <div title='Edit This Card'>
                  <i className='ion ion-edit' /> Edit
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

CardItem.propTypes = {
  card: PropTypes.any,
  editButtonFn: PropTypes.any,
  deleteButtonFn: PropTypes.any,
  disableDelete: PropTypes.any
};

export default CardItem;
