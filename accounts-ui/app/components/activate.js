import React from 'react';
import { Link } from 'react-router'
import axios from 'axios'
import cookie from 'react-cookie'
import CircularProgress from 'material-ui/CircularProgress'

class Activate extends React.Component {
   constructor(){
      super()
      this.state = {
         errorMessage:'',
         code:null,
         progress:false
      }
   }
   componentWillMount() {
     if(__isBrowser) document.title = "CloudBoost | Activate"
     if(this.props.location.query.code == undefined){
         this.props.history.pushState('login')
      } else {
         this.state.code = this.props.location.query.code
      }
   }
   componentDidMount() {
      if(!__isDevelopment){
        /****Tracking*********/
         mixpanel.track('Portal:Visited Activation Page', { "Visited": "Visited Activation page in portal!"});
        /****End of Tracking*****/
      }
      this.activate()
   }
   activate(){
      this.setProgress(true)
      let postData = {code:this.state.code}
      axios.post(USER_SERVICE_URL+"/user/activate",postData).then(function(data){
         cookie.save('userId', data.data._id, { path: '/' ,domain:SERVER_DOMAIN});
         cookie.save('userFullname', data.data.name, { path: '/' ,domain:SERVER_DOMAIN});
         cookie.save('email', data.data.email, { path: '/' ,domain:SERVER_DOMAIN});
         cookie.save('createdAt', data.data.createdAt, { path: '/' ,domain:SERVER_DOMAIN});
         window.location.href = DASHBOARD_URL;
      }.bind(this),function(error){
         this.setProgress(false)
         this.state['errorMessage'] = 'Invalid Activation code.'
         if(error.response == undefined){
            this.state['errorMessage'] = "Sorry, we currently cannot process your request, please try again later."
         }
         this.setState(this.state)
      }.bind(this))
   }
   setProgress(which){
      this.state.progress = which
      this.setState(this.state)
   }
   render() {
      return (
         <div>
            <div className={this.state.progress ? 'loader':'hide'}>
               <CircularProgress color="#4E8EF7" size={50} thickness={6} />
            </div>
          	<div id="login" className={!this.state.progress ? '':'hide'}>
               <div id="image">
                  <img className="logo" src="public/assets/images/CbLogoIcon.png"/>
               </div>
               <div id="headLine" >
                  <h3 className="tacenter hfont">Account Activation.</h3>
               </div>
               <div id="box" >
                  <h5 className="tacenter bfont">Please wait while we are activating your account...</h5>
               </div>
         		<div className="loginbox">
                  <h5 className="tacenter red">{ this.state.errorMessage }</h5>
                  <h4 className="tacenter"><Link to={ LOGIN_URL }><span className="forgotpw">Go to login</span></Link> </h4>
         		</div>
         	</div>
         </div>
      );
   }
}

export default Activate;