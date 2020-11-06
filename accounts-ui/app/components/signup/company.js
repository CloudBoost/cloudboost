import React, { Component } from 'react'
import CircularProgress from 'material-ui/CircularProgress'

class Company extends Component {
  constructor(props) {
    super(props)
    this.state = {
      companyName: "",
      phone: "",
      companySize: "1-10",
      jobRole: "executive",
      reference: "",
      toggleCompanyForm: false,
      errorMessage:""
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.toggleCompanyForm !== nextProps.toggleCompanyForm) {
      this.setState({ toggleCompanyForm: nextProps.toggleCompanyForm })
    }

    if (this.state.progress !== nextProps.progress) {
      this.setState({ progress: nextProps.progress })
    }
  }

  setProgress(which) {
    this.state.progress = which
    this.setState(this.state)
  }

  setCompanyDetails(e) {
    e.preventDefault();

    const isFormValid = this.formValidator();

    if (isFormValid) {
      this.props.setCompanyDetails(this.state);
    }
  }

  changeHandler(which, e) {
    this.state[which] = e.target.value
    this.setState(this.state);
  }

  formValidator() {
    // Input elements that need to be validated before submitting.
    const formElements = ["phone"];

    return formElements.every((elementName) => {
      return !this.checkForError(elementName)
    })
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
      case "phone": {
        // Removing all dashes, paranthese and spaces in phone number.
        const formattedPhoneNumber = enteredValue.replace(/[-()\s]/gi, "")

        // Theres no simple way to validate all E.164 Internation Phone Numbers. 
        const validatePhoneNum = /^\+?[1-9]\d{1,14}$/

        if (!validatePhoneNum.test(formattedPhoneNumber)) {
          errorMessage = "You haven't filled the valid phone number."
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

    this.setState({ errorMessage })

    return isInvalid;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.setCompanyDetails.bind(this)} className={this.props.toggleCompanyForm ? '' : 'hide'}>
          <input type="text"
            value={this.state.companyName}
            onChange={this.changeHandler.bind(this, 'companyName')}
            className="loginInput from-control"
            id="companyName"
            placeholder="Company Name" required />

          <input type="text"
            value={this.state.phone}
            onChange={this.changeHandler.bind(this, 'phone')}
            onBlur={this.checkForError.bind(this,'phone')}
            className="loginInput from-control"
            id="phoneNumber"
            placeholder="Phone Number (+11234567890)" required />

          <select className="companysize"
            value={this.state.companySize}
            onChange={this.changeHandler.bind(this, 'companySize')}
            id="companySize"
            required>
            <option value="1-10">Company Size - 1-10</option>
            <option value="11-50">Company Size - 11-50</option>
            <option value="50-200">Company Size - 50-200</option>
            <option value="200-1000">Company Size - 200-1000</option>
            <option value="1000+">Company Size - 1000+</option>
          </select>

          <select className="companysize"
            value={this.state.jobRole}
            onChange={this.changeHandler.bind(this, 'jobRole')} 
            id="jobRole" required>
            <option value="executive">Job Role - Executive</option>
            <option value="vp">Job Role - VP</option>
            <option value="projectManager">Job Role - Project Manager</option>
            <option value="developer">Job Role - Developer</option>
          </select>

          <input type="text"
            value={this.state.reference}
            onChange={this.changeHandler.bind(this, 'reference')}
            className="loginInput from-control"
            id="hearAbout"
            placeholder="How did you hear about us?" required />

          <button className="loginbtn" id="finishSignUp"
            type="submit"> Finish Setup </button>
        </form>
      </div>
    )
  }
}

export default Company