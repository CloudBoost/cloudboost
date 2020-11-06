import React from 'react';
import planList from './plans';
var valid = require('card-validator');

class SelectCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPlan: planList[0]
        };
    }
    componentWillMount() {
        try {
            this.setState({
                selectedPlan: planList[this.props.planId]
            })
        } catch (e) {
            this.setState({selectedPlan: planList[0]})
        }
    }
    selectCard(card) {
        this.props.selectCard(card);
    }
    getCardType(number) {
        return this.props.getCardType(number);
    }
    purchaseButton() {
        if (this.props.selectedCard.cardId) {
            let cvv = this.refs[this.props.selectedCard.cardId].value
            if (valid.cvv(cvv).isValid) {
                $(this.refs[this.props.selectedCard.cardId]).css('border', 'none')
                this.props.toggleBilling(true)
            } else {
                $(this.refs[this.state.selectedCard.cardId]).css('border', '2px solid red')
            }
        }
    }
    toggleAddcard(value) {
        this.props.toggleAddcard(value);
    }

    render() {
        let selectPlanisSame = this.state.selectedPlan.id == this.props.planId
        let downgradePlan = this.state.selectedPlan.id < this.props.planId
        return (
            <div>
                <div className={this.props.addCardToggled || this.props.billingToggled || selectPlanisSame
                    ? 'hide'
                    : ''}>
                    {this.props.cards.length
                        ? this.props.cards.map((card, i) => {
                            return <div className={this.props.selectedCard.cardId == card.cardId
                                ? "cardadded selectedcard"
                                : "cardadded"} key={i} onClick={this.selectCard.bind(this, card)}>
                                <img src={"/assets/images/" + this.getCardType(card.number) + ".png"} className="cardimage"/>
                                <span className="cardnumber">{card.number}</span>
                                <span className="cardname">{card.name}</span>
                                <input type="text" className="cardcvv" placeholder="CVV" ref={card.cardId}/>
                            </div>
                        })
                        : <div style={{
                            padding: 68,
                            textAlign: 'center'
                        }}>
                            <i className="fa fa-credit-card cardnotfound" aria-hidden="true"></i>
                            <p className="addacardmessage">Please add a card to make a paymentt.</p>
                        </div>
}
                </div>
                <div className={this.props.addCardToggled || this.props.billingToggled || selectPlanisSame
                    ? 'hide'
                    : 'buttons'}>
                    <button className="purchase" onClick={this.purchaseButton.bind(this)}>{downgradePlan
                            ? "DOWNGRADE PLAN"
                            : "PURCHASE PLAN"}</button>
                    <button className="addcard" onClick={this.toggleAddcard.bind(this, true)}>ADD CARD</button>
                </div>
                <div className={selectPlanisSame
                    ? ''
                    : 'hide'}>
                    <div style={{
                        padding: 68,
                        textAlign: 'center'
                    }}>
                        <i className="fa fa-thumbs-o-up cardnotfound" aria-hidden="true"></i>
                        <p className="addacardmessage">You are already on this plan.</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default SelectCard;
