import React, { Component } from 'react'
import valid from 'card-validator'
import CircularProgress from 'material-ui/CircularProgress'
import countries from '../../../config/countries'

class Card extends Component {
  constructor(props) {
    super(props)
    this.state = {
      togglePaymentForm: false,
      toggleCompanyForm: false,
      toggleApp: true,
      isCardCharged: false,
      progress: false,
      annual: false,
      errorMessage: '',
      token: '',
      cardName: '',
      cardNumber: '',
      displayCardNumber: '',
      cardCVV: '',
      expMonth: '',
      expYear: '',
      addrLine1: '',
      addrLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      showCVV: false
    }
  }

  componentWillMount() {
    let allYears = []
    let currYear = parseInt(new Date().getFullYear())
    for (let i = currYear; i <= currYear + 20; i++) {
      allYears.push(i)
    }    
    this.setState({ allYears })
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.togglePaymentForm !== nextProps.togglePaymentForm) {
      this.setState({togglePaymentForm: nextProps.togglePaymentForm});
    }

    if (this.state.isCardCharged !== nextProps.isCardCharged) {
      this.state.isCardCharged = nextProps.isCardCharged;
      this.setState(this.state);
    }

    if (this.state.toggleApp !== nextProps.toggleApp) {
      this.state.toggleApp = nextProps.toggleApp;
      this.setState(this.state);
    }
  }  

  checkForError(which, e) {
    // Getting user entered value for provided input element("which") from state.
    const enteredValue = this.state[which];

    let errorMessage = "";
    let isInvalid = true;

    function isEmpty(value) {
      return value.length === 0;
    }

    switch (which) {
      case "cardName": {
        if (isEmpty(enteredValue)) {
          errorMessage = "You haven't filled the Name."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "cardNumber": {
        if (!valid.number(enteredValue).isValid) {
          errorMessage = "You have entered invalid card number."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "cardCVV": {
        if (!valid.cvv(enteredValue).isValid) {
          errorMessage = "You have entered invalid cvv number."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "expMonth": {
        if (!valid.expirationMonth(enteredValue).isValid) {
          errorMessage = "Invalid expiration month for you card."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "expYear": {
        if (!valid.expirationYear(enteredValue).isValid) {
          errorMessage = "Invalid expiration year for you card."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "addrLine1": {
        if (isEmpty(enteredValue)) {
          errorMessage = "You haven't fill the address."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "city": {
        if (isEmpty(enteredValue)) {
          errorMessage = "You haven't fill the city."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "zipCode": {
        if (isEmpty(enteredValue)) {
          errorMessage = "You haven't fill the zip code."
        } else {
          isInvalid = false;
        }
        break;
      }

      case "country": {
        if (isEmpty(enteredValue)) {
          errorMessage = "You haven't choosed a country."
        } else {
          isInvalid = false;
        }
        break;
      }

      default: {
        errorMessage = "";
        isInvalid = false;
      }
    }

    // If reference is passed add relevent class name to make them look invalid.
    if (e) {
      if (isInvalid) {
        e.target.classList.add('has-error');
      } else {
        e.target.classList.remove('has-error')
      }
    }

    this.setState({ errorMessage})

    return isInvalid;
  }

  formValidator(){
    // Input elements that need to be validated before submitting.
    const formElements = ["cardName", "cardNumber", "cardCVV", "expMonth", "expYear", "addrLine1", "city", "zipCode", "country"];

    return formElements.every((elementName)=>{
      return !this.checkForError(elementName)
    })
  }

  changeHandler(which, e) {
    if (which === 'cardNumber') {
      if (e.target.value.replace(/ /g, '').length <= 16) {
        this.state.cardNumber = e.target.value.replace(/ /g, '')
        this.state.displayCardNumber = this.formatCardNumber(e.target.value)
      }
    } else {
      this.state[which] = e.target.value
    }
    this.setState(this.state)
  }

  processCreditCard(e) {
    e.preventDefault()    
    
    const isFormValid = this.formValidator();

    if (isFormValid) {
      this.setCardProgress(true);
      
      const thisComponent = this
      const stripeResponseHandler = (status, response) => {
        if (response.error) {
          thisComponent.state.errorMessage = response.error.message
          thisComponent.state.toggleApp = false;
          thisComponent.setState(thisComponent.state)
          thisComponent.props.setCardDetails(thisComponent.state)
          thisComponent.setProgress(false)
        } else {
          thisComponent.state.togglePaymentForm = false
          thisComponent.state.toggleCompanyForm = true
          thisComponent.state.token = response.id
          thisComponent.state.annual = this.props.annual
          thisComponent.state.errorMessage = "" // If previous attempt(s) failed to submit card
          thisComponent.state.isCardCharged = true;
          thisComponent.setState(thisComponent.state)
          thisComponent.props.setCardDetails(thisComponent.state) // Send payment details to parent component
          thisComponent.setProgress(false)
        }
      }

      Stripe.createToken({
        name: this.state.cardName,
        number: this.state.cardNumber.replace(/\s+/, ""),
        exp_month: this.state.expMonth,
        exp_year: this.state.expYear,
        cvc: this.state.cardCVV.replace(/\s+/, "")
      }, stripeResponseHandler)
    } else {
      this.state.toggleApp = false;
      this.props.setCardDetails(this.state)
      this.setProgress(false)
    }
  }

  toggleCVV(e) {
    if(this.state.showCVV === true) {
      this.state.showCVV = false      
    } else {
      this.state.showCVV = true
    }
    this.setState(this.state)
  }

  formatCardNumber(number) {
    return number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1  ').trim();
  }

  setProgress(which) {
    this.state.progress = which;
    this.setState(this.state);
  }

  setCardProgress(which) {
    this.props.setCardProgress(which);
  }

  render() {
    return (
      <div className={this.props.toggleApp ? 'hide' : ''}>
        <form onSubmit={this.processCreditCard.bind(this)} className="card">
          <input type="text"
                value={this.state.cardName}
                onChange={this.changeHandler.bind(this, 'cardName')}
                onBlur={this.checkForError.bind(this, 'cardName')}
                className="loginInput form-control"
                id="cardName"
                placeholder="Card holder name." required />

          <div>
            <span className="inputCreditCardImg fa fa-credit-card"></span>
            <input type="text"
              value={this.state.displayCardNumber}
              onChange={this.changeHandler.bind(this, 'cardNumber')}
              onBlur={this.checkForError.bind(this, 'cardNumber')}
              className="loginInput form-control cardInput"
              id="cardNumber"
              placeholder="1234 5678 9101 1112" required />        
          </div>

          <div className="three-columns">              
              <span onMouseDown={this.toggleCVV.bind(this)} onMouseUp={this.toggleCVV.bind(this)} className="cvvEyeBtn fa fa-eye"></span>
              <input type="password"
                value={this.state.cardCVV}
                onChange={this.changeHandler.bind(this, 'cardCVV')}
                onBlur={this.checkForError.bind(this, 'cardCVV')}
                className={this.state.showCVV ? 'hide' : 'loginInput left form-control'}
                id="cardCVV"
                placeholder="CVV" required />

              <input type="text"
                value={this.state.cardCVV}
                onChange={this.changeHandler.bind(this, 'cardCVV')}                
                onBlur={this.checkForError.bind(this, 'cardCVV')}
                className={this.state.showCVV ? 'loginInput left form-control' : 'hide'}
                id="cardCVV"
                placeholder="CVV" required />            

              <select
                  className="loginInput center form-control"
                  id="cardMonth"
                  onChange={this.changeHandler.bind(this, 'expMonth')}
                  onBlur={this.checkForError.bind(this, 'expMonth')}
                  required>
                <option>Exp Month</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              
              <select
                  className="loginInput right form-control" 
                  onChange={this.changeHandler.bind(this, 'expYear')} 
                  id="cardYear" 
                  onBlur={this.checkForError.bind(this, 'expYear')}
                  required>
                <option>Exp Year</option>
                {this.state.allYears.map(year => <option key={year} value= {year}> {year}</option>)}
              </select>              
          </div>

          <div className="two-columns">
            <input type="text"
              value={this.state.addrLine1}
              onChange={this.changeHandler.bind(this, 'addrLine1')}
              onBlur={this.checkForError.bind(this, 'addrLine1')}
              className="loginInput left form-control"
              id="streetAdd1"
              placeholder="Street Address 1" required />

            <input type="text"
              value={this.state.addrLine2}
              onChange={this.changeHandler.bind(this, 'addrLine2')}
              className="loginInput right form-control"
              id="streetAdd2"
              placeholder="Street Address 2 (Optional)" />
          </div>

          <input type="text"
            value={this.state.city}
            onChange={this.changeHandler.bind(this, 'city')}
            onBlur={this.checkForError.bind(this, 'city')}
            className="loginInput form-control"
            id="city"
            placeholder="City" required />

          <div className="two-columns">
              <input type="text"
                value={this.state.state}
                onChange={this.changeHandler.bind(this, 'state')}
                className="loginInput left form-control"
                id="stateAdd"
                placeholder="State (Optional)" />

              <input type="text"
                value={this.state.zipCode}
                onChange={this.changeHandler.bind(this, 'zipCode')}
                onBlur={this.checkForError.bind(this, 'zipCode')}
                className="loginInput right form-control"
                id="zipCode"
                placeholder="Zip Code" required />
          </div>
          
          <select value={this.state.country}
            onChange={this.changeHandler.bind(this, 'country')}
            onBlur={this.checkForError.bind(this, 'country')}
            className="loginInput form-control" id="country" required>
            <option value="">Select Country</option>
            {countries.map((country) => <option value={country.code} key={country.code}>  {country.label}  </option>)}
          </select>

          <button className={this.props.btnClassName} id="signupCardBtn" type="submit"> Signup </button>
        </form>
      </div>
    )
  }
}

export default Card
