import React from 'react';
import { Link } from 'react-router'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'

class ChangePassword extends React.Component {
   constructor(){
      super()
      this.state = {
         errorMessage:'',
         success: false,
         password:"",
         confirmPassword:"",
         code:null,
         progress:false
      }
   }
   componentWillMount() {
     if(__isBrowser) document.title = "CloudBoost | Change Password"
      if(this.props.location.query.code == undefined){
         this.props.history.pushState('login')
      } else {
         this.state.code = this.props.location.query.code
      }
   }
   change(){
      this.setProgress(true)
      let postData = {code:this.state.code,password:this.state.password}
      axios.post(USER_SERVICE_URL+"/user/updatePassword",postData).then(function(data){
         this.setProgress(false)
         this.state.password = ''
         this.state.confirmPassword = ''
         this.state.success = true;
         this.state['errorMessage'] = ''
         this.setState(this.state)
      }.bind(this),function(err){
         this.setProgress(false)
         this.state['errorMessage'] = 'This change password request cannot be processed right now.'
         if(err.response == undefined){
            this.state['errorMessage'] = "Sorry, we currently cannot process your request, please try again later."
         }
         this.setState(this.state)
      }.bind(this))
      if(!__isDevelopment){
          /****Tracking*********/          
           mixpanel.track('Portal:Clicked ChangePassword Button', { "Clicked": "ChangePassword Button in portal!"});
          /****End of Tracking*****/
        }
   }
   matchPasswords(e){
      e.preventDefault()
      if(this.state.password == this.state.confirmPassword){
         this.change()
      } else {
         this.state['errorMessage'] = 'Passwords do not match try again.'
         this.state.password = ''
         this.state.confirmPassword = ''
         this.setState(this.state)
      }
   }
   changeHandler(which,e){
      this.state[which] = e.target.value
      this.setState(this.state)
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
               <div id="headLine" className={this.state.success ? 'hide':''}>
                  <h3>Change your password.</h3>
               </div>
                <div id="headLine" className={!this.state.success ? 'hide':''}>
                  <h3>We've changed your password.</h3>
               </div>
               <div id="box" className={this.state.success ? 'hide':''}>
                  <h5 className="tacenter bfont">Enter your new password and we'll change it for you.</h5>
               </div>
                <div id="box" className={!this.state.success ? 'hide':''}>
                  <h5 className="tacenter bfont">We have chnaged your password. You can now login to your account.</h5>
               </div>
         		<div className={this.state.success ? 'hide':'loginbox'}>
                  <h5 className="tacenter red">{ this.state.errorMessage }</h5>
                  <form onSubmit={this.matchPasswords.bind(this)} >
            			<input type="password" value={this.state.password} onChange={this.changeHandler.bind(this,'password')} className="loginInput from-control" placeholder="Password." required/>
                     <input type="password" value={this.state.confirmPassword} onChange={this.changeHandler.bind(this,'confirmPassword')} className="loginInput from-control" placeholder="Confirm password." required/>
            			<button className="loginbtn" type="submit"> Change Password </button>
                  </form>
         		</div>
               <div className='loginbox twotop'>
                  <h5 className="tacenter">Want to Login? <Link to={ LOGIN_URL }><span className="forgotpw">Log in. </span></Link></h5>
               </div>
         	</div>
            
         </div>
      );
   }
}

export default ChangePassword;