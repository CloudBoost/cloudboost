import React from 'react';
import { Link } from 'react-router';

export default class NotFound extends React.Component {
    constructor() {
        super();
    }
    render() {
        document.getElementById("initialLoader").style.display = 'none';
        return (
            <div id="login">
                <img src="public/assets/images/CbLogoIcon.png" style={{ width: 100, height: 100, display: 'block', margin: 'auto', position: 'relative' }} />
                <center><h1>404</h1></center>
                <br />
                <center><p>This is not the webpage you are looking for</p></center>
                <div id="links">
                    <Link style={{float:'left'}} to="login">Login</Link>
                    <p style={{float:'right'}}>Don't have an account?<Link style={{marginLeft:5}} to="signup">SignUp</Link></p>
                </div>
            </div >
        );
    }
}