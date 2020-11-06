import React from 'react';
import planList from './plans';

class Element extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardImage: ''
        }
    }

    cardDetailChangeHandlerr(which, e) {
        this.props.cardDetailChangeHandler(which, e);
    }
    addCardButton() {
        this.props.addCardButton();
    }
    toggleAddcard(value) {
        this.props.toggleAddcard(value);
    }
    toggleBilling() {
        if (this.props.validatecardDetails(false)) {
            this.toggleAddcard(false)
            this.props.toggleBilling(true);
        }
    }

    getCardType(number) {
        if (number.length > 3)
            return this.props.getCardType(number);
        }
    render() {
        let cardImage = 'src/assets/images/' + this.getCardType(this.props.cardDetails.number) + '.png'
        let imageStyle = {
            background: 'url(' + cardImage + ')',
            backgroundPosition: 'right',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundOrigin: 'content-box'
        }
        return (
            <div>
                <div className={this.props.addCardToggled
                    ? ''
                    : 'hide'}>
                    <div className="fields name">
                        <span className="labels">Name</span>
                        <input type="text" name="ccname" autoComplete="cc-name" value={this.props.cardDetails.name} onChange={this.cardDetailChangeHandlerr.bind(this, 'name')} placeholder="Card holder name." className="field"/>
                    </div>
                    <div className="fields number">
                        <span className="labels">Card#</span>
                        <input type="text" name="cardnumber" autoComplete="cc-number" value={this.props.cardDetails.displayNumber} style={imageStyle} onChange={this.cardDetailChangeHandlerr.bind(this, 'number')} placeholder="1234 5678 9326 7352" className="field cardnumber"/>
                    </div>
                    <div className="fieldssmall month">
                        <span className="labels">Expiry Month</span>
                        <input type="text" autoComplete="cc-exp-month" placeholder="MM" value={this.props.cardDetails.expMonth} onChange={this.cardDetailChangeHandlerr.bind(this, 'expMonth')} className="field"/>
                    </div>
                    <div className="fieldssmall year">
                        <span className="labels">Expiry Year</span>
                        <input type="text" autoComplete="cc-exp-year" placeholder="YYYY" value={this.props.cardDetails.expYear} onChange={this.cardDetailChangeHandlerr.bind(this, 'expYear')} className="field"/>
                    </div>

                </div>
                <div className={this.props.addCardToggled
                    ? 'buttons'
                    : 'hide'}>
                    <button className={this.props.showBackBtn
                        ? "purchase"
                        : "purchase wide-button"} onClick={this.toggleBilling.bind(this)}>NEXT</button>
                    <button className={this.props.showBackBtn
                        ? "addcard"
                        : "hide"} onClick={this.toggleAddcard.bind(this, false)}>BACK</button>
                </div>
            </div>

        )
    }
}

export default Element;
