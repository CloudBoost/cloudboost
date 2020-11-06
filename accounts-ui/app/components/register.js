import React from 'react';
import { Link } from 'react-router'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'
import DOMAIN_LIST from './domains'

class Register extends React.Component {
   constructor(){
      super()
      this.state = {
         errorMessage:'',
         success: false,
         name:'',
         email:'',
         password:'',
         progress:false,
         isCustomDomain:false,
         companyName:'',
         companySize:'1-10',
         phoneNumber:'',
         reference:'',
         jobRole:'executive',
         resendEmail:false
      }
   }
   componentDidMount(){
     if(__isBrowser) document.title = "CloudBoost | Sign Up"
      if(!__isDevelopment){
          /****Tracking*********/
           mixpanel.track('Portal:Visited SignUp Page', { "Visited": "Visited Sign Up page in portal!"});
          /****End of Tracking*****/
        }
   }
   signUp(e){
      if(e.preventDefault){
         e.preventDefault()
      }
      this.setProgress(true)
      let postData = {}
      if(this.state.isCustomDomain){
        postData = {email:this.state.email,password:this.state.password,name:this.state.name,isAdmin:false,companyName:this.state.companyName,companySize:this.state.companySize,phoneNumber:this.state.phoneNumber,reference:this.state.reference,jobRole:this.state.jobRole}
      } else {
        postData = {email:this.state.email,password:this.state.password,name:this.state.name,isAdmin:false}
      }

      axios.post(USER_SERVICE_URL+"/user/signup",postData).then(function(data){
         if(!__isDevelopment){
            /****Tracking*********/
             mixpanel.alias(this.state.email);


            if(this.state.isCustomDomain){
              mixpanel.people.set({ "Name": this.state.name,"$email": this.state.email,"CompanyName": this.state.companyName,"CompanySize": this.state.companySize,"PhoneNumber": this.state.phoneNumber,"JobRole": this.state.jobRole,"reference":this.state.reference});
             //mixpanel.identify(data._id);

              mixpanel.register({ "Name": this.state.name,"Email": this.state.email,"CompanyName": this.state.companyName,"CompanySize": this.state.companySize,"PhoneNumber": this.state.phoneNumber,"JobRole": this.state.jobRole,"reference":this.state.reference});
              mixpanel.track('Signup', { "Name": this.state.name,"Email": this.state.email,"CompanyName": this.state.companyName,"CompanySize": this.state.companySize,"PhoneNumber": this.state.phoneNumber,"JobRole": this.state.jobRole,"reference":this.state.reference});
            } else {
              mixpanel.people.set({ "Name": this.state.name,"$email": this.state.email});
             //mixpanel.identify(data._id);

              mixpanel.register({ "Name": this.state.name,"Email": this.state.email});
              mixpanel.track('Signup', { "Name": this.state.name,"Email": this.state.email});
            }

            /****End of Tracking*****/
         }
         this.setProgress(false)
         this.state.password = ''
         this.state.name = ''
         this.state.success = true;
         this.state['errorMessage'] = ''
         this.setState(this.state)
      }.bind(this),function(err){
         this.setProgress(false)
         this.state.isCustomDomain = false;
         this.state.email = '';
         this.state['errorMessage'] = "User with same email already exists. If this email belongs to you, you can reset your password."
         if(err.response == undefined){
            this.state['errorMessage'] = "Oops, we couldn't connect to the server. Please try again later."
         }
         this.setState(this.state)
      }.bind(this))
      if(!__isDevelopment){
            /****Tracking*********/
             mixpanel.track('Portal:Clicked SignUp Button', { "Clicked": "SignUp Button in portal!"});
            /****End of Tracking*****/
          }
   }

   validateEmail(e){
      e.preventDefault()
      let domain = this.state.email.replace(/.*@/, "")
      // let isCustomDomain = DOMAIN_LIST.indexOf(domain) === -1
      let isCustomDomain = true // add company details for all Email ids.
      if(isCustomDomain){
        this.setState({isCustomDomain:isCustomDomain})
      } else this.signUp(e)
   }
   resend() {
        let postData = {
            email: this.state.email
        }
        axios.post(USER_SERVICE_URL + "/user/resendverification", postData)
        this.setState({resendEmail:true})
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
            <div id="signup" className={!this.state.progress ? '':'hide'}>
         		<div id="image">
         			<img className="logo" src="public/assets/images/CbLogoIcon.png"/>
         		</div>
         		<div id="headLine" className={this.state.success ? 'hide':''}>
         			<h3>One account. For all of CloudBoost.</h3>
         		</div>
               <div id="headLine" className={!this.state.success ? 'hide':''}>
                  <h3>We've sent you the verification email.</h3>
               </div>
         		<div id="box" className={this.state.success ? 'hide':''}>
         			<h5 className={!this.state.isCustomDomain ? 'tacenter bfont':'hide'}>All Plans come with 14 day free trial.</h5>
               <h5 className={this.state.isCustomDomain ? 'tacenter bfont':'hide'}>One last step.</h5>
         		</div>
               <div id="box" className={!this.state.success ? 'hide':''}>
                  <h5 className={ this.state.resendEmail ? "hide" : "tacenter bfont"}>We have sent you the verification email. Please make sure you check spam.</h5>
                  <h5 className={ this.state.resendEmail ? "tacenter bfont" : "hide"}>Verification email sent again.</h5>
                  <h5 className="tacenter">
                    <span className={ this.state.resendEmail ? "hide" : "forgotpw"} onClick={this.resend.bind(this)} style={{cursor:'pointer'}}>Did not get it? Send verification email again.</span>
                    <span className={ this.state.resendEmail ? "forgotpw" : "hide"} onClick={this.resend.bind(this)} style={{cursor:'pointer'}}>Resend again?</span>
                  </h5>
               </div>
         		<div id="loginbox" className={!this.state.success ? '':'hide'}>
                  <h5 className="tacenter red">{ this.state.errorMessage }</h5>
                  <form onSubmit={this.validateEmail.bind(this)} className={!this.state.isCustomDomain ? '':'hide'}>
            			   <input type="text" value={this.state.name} onChange={this.changeHandler.bind(this,'name')} className="loginInput from-control" placeholder="Full Name" required/>
                     <input type="email" value={this.state.email} onChange={this.changeHandler.bind(this,'email')} className="loginInput from-control" placeholder="Email" required/>
                     <input type="password" value={this.state.password} onChange={this.changeHandler.bind(this,'password')} className="loginInput from-control" placeholder="Password" required/>
            			<button className="loginbtn"  type="submit"> Sign up for CloudBoost </button>
                  </form>
                  <form onSubmit={this.signUp.bind(this)} className={this.state.isCustomDomain ? '':'hide'}>
            			   <input type="text" value={this.state.companyName} onChange={this.changeHandler.bind(this,'companyName')} className="loginInput from-control" placeholder="Company Name" required/>
                     <input type="text" value={this.state.phoneNumber} onChange={this.changeHandler.bind(this,'phoneNumber')} className="loginInput from-control" placeholder="Phone Number" required/>
                     <select className="companysize" required value={this.state.companySize} onChange={this.changeHandler.bind(this,'companySize')}>
                       <option value="1-10">Company Size - 1-10</option>
                       <option value="11-50">Company Size - 11-50</option>
                       <option value="50-200">Company Size - 50-200</option>
                       <option value="200-1000">Company Size - 200-1000</option>
                       <option value="1000+">Company Size - 1000+</option>
                     </select>
                     <select className="companysize" required value={this.state.jobRole} onChange={this.changeHandler.bind(this,'jobRole')}>
                       <option value="executive">Job Role - Executive</option>
                       <option value="vp">Job Role - VP</option>
                       <option value="projectManager">Job Role - Project Manager</option>
                       <option value="developer">Job Role - Developer</option>
                     </select>
                     <input type="text" value={this.state.reference} onChange={this.changeHandler.bind(this,'reference')} className="loginInput from-control" placeholder="How did you hear about us ?" required/>
            			<button className="loginbtn"  type="submit"> Sign up for CloudBoost </button>
                  </form>
         		</div>
               <div className={!this.state.success ? 'loginbox twotop':'hide'}>
                  <h5 className="tacenter bfont fs13">By creating an account, you agree with the <a href="https://cloudboost.io/terms" target="_blank" className="forgotpw">Terms and Conditions </a>.</h5>
               </div>

               <div className={!this.state.success ? 'loginbox twotop':'hide'}>
                  <h5 className="tacenter">Already have an account? <Link to={ LOGIN_URL }><span className="forgotpw">Log in. </span></Link></h5>
               </div>

            </div>
      	</div>
      );
   }
}

export default Register;
