import React from 'react';
import planList from './plans';
import {paymentCountries} from './config';
var valid = require('card-validator');
import {xhrDashBoardClient} from './xhrClient';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import {Modal, Button} from 'react-bootstrap';
import PlanDetails from './planDetails';
import Addcard from "./addcard";
import Billing from './billing';
import SelectCard from './selectcard';

//require('./style.scss')
class Upgrade extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPlan: planList[0],
            cardDetails: {
                number: "",
                expMonth: "",
                expYear: "",
                name: "",
                billing: {
                    name: "",
                    addrLine1: "",
                    addrLine2: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: ""
                }
            },
            addCardToggled: false,
            billingToggled: false,
            error: null,
            selectedCard: {
                number: "",
                expMonth: "",
                expYear: "",
                name: "",
                cardId: ""
            },
            openPlanSelector: false
        };
    }
    componentWillMount() {
        this.getCards()
        try {
            this.setState({
                selectedPlan: planList[this.props.planId]
            })
        } catch (e) {
            this.setState({selectedPlan: planList[0]})
        }
    }
    componentWillReceiveProps() {
        if (!this.state.loading && this.state.loading !== undefined) {
            if (this.state.cards.length === 0) {
                this.toggleAddcard(true)
            }
        }
    }
    createSale(appId, cardDetails, planId) {
        this.setState({loading: true});
        let reqObj = {
            cardDetails: cardDetails,
            planId: planId
        };
        xhrDashBoardClient.post('/' + appId + '/sale', reqObj).then(response => {
            this.setState({loading: false});
        }).catch(error => {
            this.setState({loading: false});
            console.log('inside createSale error catch error: ');
            console.log(error);
        });

    }
    getCards() {
        this.setState({loading: true});
        xhrDashBoardClient.get('/cards').then(response => {
            this.setState({loading: false, cards: response.data});
        }).catch(error => {
            this.setState({loading: false});
            console.log('get cards error', error);
        })

    }

    addCard(name, number, expMonth, expYear) {

        this.setState({loading: true});

        let postObject = {}
        postObject.name = name
        postObject.number = number
        postObject.expMonth = expMonth
        postObject.expYear = expYear

        xhrDashBoardClient.post('/card', postObject).then(response => {
            this.getCards();
        }, err => {
            Messenger().post({
                message: "Error Adding card",
                type: type || 'error',
                showCloseButton: true
            });
            this.setState({loading: false});
        })

    }

    purchaseButton() {
        if (this.state.selectedCard.cardId) {
            let cvv = this.refs[this.state.selectedCard.cardId].value
            if (valid.cvv(cvv).isValid) {
                $(this.refs[this.state.selectedCard.cardId]).css('border', 'none')
                this.toggleBilling(true)
            } else {
                $(this.refs[this.state.selectedCard.cardId]).css('border', '2px solid red')
            }
        }
    }
    purchase(e) {
        e.preventDefault()
        return;
        //     // actual create sale call
        //     this.createSale(this.props.appId, this.state.cardDetails, selectedPlan.id)
        //
    }
    addCardButton() {
        let {number, name, expMonth, expYear} = this.state.cardDetails
        if (!name) {
            this.showError('name', true);
            return false;
        } else
            this.showError('name', false);
        if (!valid.number(number).isValid) {
            this.showError('number', true);
            return false;
        } else
            this.showError('number', false);
        if (!valid.expirationYear(expYear).isValid) {
            this.showError('year', true);
            return false;
        } else
            this.showError('year', false);
        if (!valid.expirationMonth(expMonth).isValid) {
            this.showError('month', true);
            return false;
        } else
            this.showError('month', false);

        this.addCard(name, number, expMonth, expYear)
        this.toggleAddcard(false)
    }
    toggleAddcard(what) {
        this.setState({addCardToggled: what})
    }
    toggleBilling(what) {
        this.setState({billingToggled: what})
    }
    cardDetailChangeHandler(which, e) {
        this.state.cardDetails[which] = e.target.value
        this.setState(this.state)
    }
    billingChangeHandler(which, e) {
        this.state.cardDetails.billing[which] = e.target.value
        this.setState(this.state)
    }
    showError(which, show) {
        if (show)
            $('.' + which).css('border', '2px solid red')
        else
            $('.' + which).css('border', 'none')
    }
    getCardType(number) {
        number = number.split('-')[0]
        let type = 'visa'
        let card = valid.number(number).card
        if (card) {
            if (card.type != 'visa')
                type = 'mastercard'
        }
        return type
    }
    selectCard(card) {
        this.setState({selectedCard: card})
    }

    render() {
        let selectPlanisSame = this.state.selectedPlan.id == this.props.planId
        let downgradePlan = this.state.selectedPlan.id < this.props.planId
        return (
            <Modal show={this.props.show} bsSize={'large'} onHide={this.props.close} dialogClassName='options-modal'>
                <Modal.Body>
                    <div className="payment">
                        {this.state.loading
                            ? <div className="cards">
                                    <RefreshIndicator size={50} left={70} top={0} status="loading" className="loadermodal"/>
                                </div>
                            : <div className="cards">

                                <div className={this.state.billingToggled
                                    ? 'hide'
                                    : 'heading'}>
                                    <span className="main">Payment Information</span>
                                    <span className="sub">100% money back guarantee for the first 30 days on paid plans.</span>
                                </div>
                                <SelectCard planId={this.props.planId} addCardToggled={this.state.addCardToggled} billingToggled={this.state.billingToggled} cards={this.state.cards} selectedCard={this.state.selectedCard} selectCard={this.selectCard.bind(this)} getCardType={this.getCardType.bind(this)} purchaseButton={this.purchaseButton.bind(this)} toggleAddcard={this.toggleAddcard.bind(this)} toggleBilling={this.toggleBilling.bind(this)}/>
                                <Addcard addCardToggled={this.state.addCardToggled} cardDetails={this.state.cardDetails} cardDetailChangeHandler={this.cardDetailChangeHandler.bind(this)} addCardToggled={this.state.addCardToggled} addCardButton={this.addCardButton.bind(this)} toggleAddcard={this.toggleAddcard.bind(this)}/>
                                <Billing planId={this.props.planId} purchase={this.purchase.bind(this)} billingToggled={this.state.billingToggled} cardDetails={this.state.cardDetails} billingChangeHandler={this.billingChangeHandler.bind(this)} toggleBilling={this.toggleBilling.bind(this)}/>

                            </div>
}
                        <PlanDetails/>
                    </div>
                </Modal.Body>
            </Modal>
        )
    }
}

export default Upgrade;
