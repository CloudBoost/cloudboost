import React from 'react';
import planList from './plans';
import {Menu, MenuItem, Popover} from 'material-ui'
var valid = require('card-validator');

const style = {
    menuItem: {
        width: '112px'
    }
}
class SelectCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
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
                this.props.purchase()
            } else {
                $(this.refs[this.props.selectedCard.cardId]).css('border', '2px solid red')
            }
        }
    }
    toggleAddcard(value) {
        this.props.toggleAddcard(value);
    }
    handleKeyChange(e) {
        if (e.keyCode === 13)
            this.purchaseButton();
        }
    deleteCard(cardId) {
        this.props.deleteCard(cardId);
    }
    handleTouchTap = (cardId, event) => {
        event.preventDefault();

        this.setState({open: true, anchorEl: event.currentTarget, cardId: cardId});
    }
    handleRequestClose = () => {
        this.setState({open: false});
    }

    render() {
        let selectPlanisSame = this.props.selectedPlan.id == this.props.planId
        let downgradePlan = this.props.selectedPlan.id < this.props.planId
        return (
            <div>
                <div className={this.props.addCardToggled || this.props.billingToggled || selectPlanisSame
                    ? 'hide'
                    : 'cardDiv'}>
                    {this.props.cards.length
                        ? this.props.cards.map((card, i) => {
                            return <div className={this.props.selectedCard.cardId == card.cardId
                                ? "cardadded selectedcard"
                                : "cardadded"} key={i} onClick={this.selectCard.bind(this, card)}>
                                <img src={"src/assets/images/" + this.getCardType(card.number) + ".png"} className="cardimage"/>
                                <span className="cardnumber">{"xxxx-xxxx-xxxx-" + card.number.split('-')[1]}</span>
                                <input type="text" className="cardcvv" name="cvc" autoComplete="cc-csc" placeholder="CVV" onKeyUp={this.handleKeyChange.bind(this)} ref={card.cardId}/>
                                <i className="ion ion-ios-more-outline moreIcon" onClick={this.handleTouchTap.bind(this, card.cardId)}></i>
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
                    <button className={downgradePlan
                        ? 'downgrade'
                        : 'purchase'} onClick={this.purchaseButton.bind(this)}>{downgradePlan
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
                <Popover open={this.state.open} anchorEl={this.state.anchorEl} anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }} targetOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }} onRequestClose={this.handleRequestClose}>
                    <Menu>
                        <MenuItem style={style.menuItem} primaryText="Delete Card" onClick={this.deleteCard.bind(this, this.state.cardId)}/>
                    </Menu>
                </Popover>
            </div>
        )
    }
}

export default SelectCard;
