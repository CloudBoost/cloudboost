import React, { Component } from 'react'
import { debounce } from 'lodash';
import axios from 'axios';
export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      appName: '',
      couponCode: '',
      toggleApp: true
    };
    this.couponHandler = debounce(this.checkCouponCode.bind(this), 300);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.toggleApp !== nextProps.toggleApp) {
      this.setState({toggleApp: nextProps.toggleApp});
    }
  }

  changeHandler(which, e) {
    this.state[which] = e.target.value
    this.setState(this.state)
  }

  createApp(e){
    e.preventDefault()
    this.state.toggleApp = false
    this.setState(this.state)
    this.props.setAppDetails(this.state)
  }

  checkCouponCode() {
    const { couponCode } = this.state;
    if (couponCode) {
		this.setState({ checkingCode: true });
		axios.post(`${USER_SERVICE_URL}/check-coupon`, { couponCode })
			.then(() => this.setState({ checkingCode: false, isValidCode: true }))
			.catch(() => this.setState({ checkingCode: false, isValidCode: false }))
    }

  }

  render() {
    return (
        <form onSubmit={this.createApp.bind(this)} className={this.state.toggleApp ? '':'hide'} >
          <input  type="text"
                  value={this.state.appName}
                  onChange={this.changeHandler.bind(this, 'appName')}
                  className="loginInput form-control"
                  id="SignupAppName"
                  placeholder="App Name" required />
          <input type="text"
				value={this.state.couponCode}
				onChange={this.changeHandler.bind(this, 'couponCode')}
				onKeyUp={this.couponHandler}
				className="loginInput form-control"
				id="couponCode"
				placeholder="Coupon code (if available)" />
				{ this.state.checkingCode && <div style={{padding: '10px 0px', textAlign: 'right'}}>
					<span> Checking coupon code validity</span>
					<i className="fa fa-circle-o-notch fa-spin"></i>
				</div>
				}

				{ !this.state.checkingCode && this.state.isValidCode && this.state.couponCode && <div style={{padding: '10px 0px', textAlign: 'right', color: 'green'}}>
						<span> Coupon code is valid </span>
						<i className="fa fa-check"></i>
					</div>
				}

				{ !this.state.isValidCode && !this.state.checkingCode && this.state.couponCode && <div style={{padding: '10px 0px', textAlign: 'right', color: 'red'}}>
						<span> Coupon code is invalid </span>
						<i className="fa fa-times"></i>
					</div>
				}
          <button type="submit" id="SignupAppBtn" disabled={this.state.couponCode && !this.state.isValidCode} className={this.props.btnClassName}>Create app</button>
        </form>
    )
  }
};