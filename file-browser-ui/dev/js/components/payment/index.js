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
                displayNumber: "",
                billing: {
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
            openPlanSelector: false,
            showBackBtn: true
        };
    }
    componentWillMount() {
        this.getCards()
        try {
            let newPlanId = (this.props.planId === planList.length
                ? this.props.planId - 1
                : this.props.planId)
            this.setState({selectedPlan: planList[newPlanId]})
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
        console.log(appId, cardDetails, planId);
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
    deleteCard(cardId) {
        this.setState({loading: true});
        xhrDashBoardClient.delete('/card/' + cardId).then(response => {
            this.state.cards = this.state.cards.filter(function(x) {
                return x.cardId != cardId;
            });
            this.state.loading = false;
            this.setState(this.state);
        }).catch(error => {
            this.setState({loading: false});
            console.log('inside createSale error catch error: ');
            console.log(error);
        });
    }

    selectPlan(plan) {
        this.setState({selectedPlan: plan})
    }

    getCards() {
        this.setState({loading: true});
        xhrDashBoardClient.get('/cards').then(response => {
            if (response.data.length === 0)
                this.setState({loading: false, cards: response.data, addCardToggled: true, showBackBtn: false});
            else {

                this.setState({loading: false, cards: response.data, selectedCard: response.data[0]});
            }
        }).catch(error => {
            this.setState({loading: false});
            console.log('get cards error', error);
        })

    }

    addCard(name, number, expMonth, expYear, billing) {

        this.setState({loading: true});

        let postObject = {}
        postObject.name = name
        postObject.number = number
        postObject.expMonth = expMonth
        postObject.expYear = expYear
        postObject.billing = billing

        xhrDashBoardClient.post('/card', postObject).then(response => {
            this.setState({
                cardDetails: {
                    number: "",
                    expMonth: "",
                    expYear: "",
                    name: "",
                    displayNumber: "",
                    billing: {
                        addrLine1: "",
                        addrLine2: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: ""
                    }
                }
            })
            this.getCards();
        }, err => {
            console.log(err);
            Messenger().post({message: err.response.data, type: 'error', showCloseButton: true});
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
                $(this.refs[this.state.selectedCard.cardId]).css('border', '2px solid #D60A00')
            }
        }
    }
    purchase() {
        // actual create sale call
        this.createSale(this.props.appId, this.state.selectedCard, this.state.selectedPlan.id)
    }
    addCardButton() {
        let {number, name, expMonth, expYear, billing} = this.state.cardDetails
        if (this.validatecardDetails(true)) {
            this.addCard(name, number, expMonth, expYear, billing)
            this.toggleBilling(false);
        }
    }

    validatecardDetails(isBilling) {
        let reg = /^\d+$/;
        let {number, name, expMonth, expYear, billing} = this.state.cardDetails
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
        if (isBilling) {
            if (!billing.addrLine1) {
                this.showError('addrLine1', true);
                return false;
            } else
                this.showError('addrLine1', false);

            //address field 2 is optional.
            this.showError('addrLine2', false);

            if (!billing.city) {
                this.showError('city', true);
                return false;
            } else
                this.showError('city', false);
            if (!billing.state) {
                this.showError('state', true);
                return false;
            } else
                this.showError('state', false);
            if (!reg.test(billing.zipCode)) {
                this.showError('zipcode', true);
                return false;
            } else
                this.showError('zipcode', false);
            if (!billing.country) {
                this.showError('country', true);
                return false;
            } else
                this.showError('country', false);
            }
        return true;

    }

    toggleAddcard(what) {
        this.setState({addCardToggled: what})
    }
    toggleBilling(what) {
        this.setState({billingToggled: what})
    }
    cardDetailChangeHandler(which, e) {
        if (which === 'number') {
            if (e.target.value.replace(/ /g, '').length <= 16) {
                this.state.cardDetails[which] = e.target.value
                this.state.cardDetails['displayNumber'] = this.formatCardNumber(e.target.value)
            }
        } else {
            this.state.cardDetails[which] = e.target.value
        }
        this.setState(this.state)
    }
    formatCardNumber(number) {
        number = number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1  ').trim();
        return number;
    }
    billingChangeHandler(which, e) {
        this.state.cardDetails.billing[which] = e.target.value
        this.setState(this.state)
    }
    showError(which, show) {
        if (show) {
            $('.' + which).css('border', '2px solid #D60A00')
        } else
            $('.' + which).css('border', 'none')
    }
    getCardType(number) {
        number = number.split('-')[0]
        let card = valid.number(number).card
        return card.type
    }
    selectCard(card) {
        this.setState({selectedCard: card})
    }

    render() {
        let selectPlanisSame = this.state.selectedPlan.id == this.props.planId
        let downgradePlan = this.state.selectedPlan.id < this.props.planId
        return (
            <Modal show={this.props.show} bsSize={'large'} onHide={this.props.close} dialogClassName='payment-modal'>
                <Modal.Body>
                    <div className="payment">

                        {this.state.loading
                            ? <div className="cards">
                                    <RefreshIndicator size={30}
                                                      left={70}
                                                      top={0}
                                                      status="loading"
                                                      className="loadermodal"/>
                                </div>
                            : <div className="cards">

                                <div className={this.state.billingToggled
                                    ? 'hide'
                                    : 'heading'}>
                                    <span className="main">Payment Information
                                        <i className="ion ion-card card-icon"></i>
                                    </span>
                                    <span className="sub">
                                        <strong>100%</strong>&nbsp; money back guarantee for the first 30 days on paid plans.
                                    </span>
                                </div>
                                <SelectCard deleteCard={this.deleteCard.bind(this)} purchase={this.purchase.bind(this)} selectedPlan={this.state.selectedPlan} planId={this.props.planId} addCardToggled={this.state.addCardToggled} billingToggled={this.state.billingToggled} cards={this.state.cards} selectedCard={this.state.selectedCard} selectCard={this.selectCard.bind(this)} getCardType={this.getCardType.bind(this)} purchaseButton={this.purchaseButton.bind(this)} toggleAddcard={this.toggleAddcard.bind(this)} toggleBilling={this.toggleBilling.bind(this)} selectedPlan={this.state.selectedPlan}/> {!selectPlanisSame
                                    ? <Addcard getCardType={this.getCardType.bind(this)} validatecardDetails={this.validatecardDetails.bind(this)} toggleBilling={this.toggleBilling.bind(this)} showBackBtn={this.state.showBackBtn} addCardToggled={this.state.addCardToggled} cardDetails={this.state.cardDetails} cardDetailChangeHandler={this.cardDetailChangeHandler.bind(this)} addCardToggled={this.state.addCardToggled} addCardButton={this.addCardButton.bind(this)} toggleAddcard={this.toggleAddcard.bind(this)}/>
                                    : null}
                                <Billing addCardButton={this.addCardButton.bind(this)} planId={this.props.planId} purchase={this.purchase.bind(this)} billingToggled={this.state.billingToggled} cardDetails={this.state.cardDetails} billingChangeHandler={this.billingChangeHandler.bind(this)} toggleBilling={this.toggleBilling.bind(this)} selectedPlan={this.state.selectedPlan}/>

                            </div>
}
                        <PlanDetails planId={this.props.planId} selectPlan={this.selectPlan.bind(this)} selectedPlan={this.state.selectedPlan}/>
                    </div>
                </Modal.Body>
            </Modal>
        )
    }
}

export default Upgrade;
