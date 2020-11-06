import React from 'react';
import planList from './plans';

class Element extends React.Component {
    constructor(props) {
        super(props);
    }

    cardDetailChangeHandler(which, e) {
        this.props.cardDetailChangeHandler(which, e);
    }
    addCardButton() {
        this.props.addCardButton();
    }
    toggleAddcard(value) {
        this.props.toggleAddcard(value);
    }

    render() {
        return (
            <div>
                <div className={this.props.addCardToggled
                    ? ''
                    : 'hide'}>
                    <div className="fields name">
                        <span className="labels">Name</span>
                        <input type="text" value={this.props.cardDetails.name} onChange={this.cardDetailChangeHandler.bind(this, 'name')} placeholder="Card holder name." className="field"/>
                    </div>
                    <div className="fields number">
                        <span className="labels">card#</span>
                        <input type="text" value={this.props.cardDetails.number} onChange={this.cardDetailChangeHandler.bind(this, 'number')} placeholder="1234 5678 9326 7352" className="field"/>
                    </div>
                    <div className="fieldssmall year">
                        <span className="labels">ex.Year</span>
                        <input type="text" placeholder="YYYY" value={this.props.cardDetails.expYear} onChange={this.cardDetailChangeHandler.bind(this, 'expYear')} className="field"/>
                    </div>
                    <div className="fieldssmall month">
                        <span className="labels">ex.Month</span>
                        <input type="text" placeholder="MM" value={this.props.cardDetails.expMonth} onChange={this.cardDetailChangeHandler.bind(this, 'expMonth')} className="field"/>
                    </div>
                </div>
                <div className={this.props.addCardToggled
                    ? 'buttons'
                    : 'hide'}>
                    <button className="purchase" onClick={this.addCardButton.bind(this)}>ADD CARD</button>
                    <button className="addcard" onClick={this.toggleAddcard.bind(this, false)}>BACK</button>
                </div>
            </div>

        )
    }
}

export default Element;
