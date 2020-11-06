import React from 'react';
import { Card, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';

class CloudUser extends React.Component {
  constructor () {
    super();
    this.state = {

    };
  }

  copyToClipboard = (element) => () => {
    var $temp = $('<input>');
    $('body').append($temp);
    $temp.val($(element).text()).select();
    document.execCommand('copy');
    $temp.remove();
  }

    handleExpandChange = (expanded) => {
      this.setState({ expanded: expanded });
    };

    handleToggle = (event, toggle) => {
      this.setState({ expanded: toggle });
    };

    handleExpand = () => {
      this.setState({ expanded: true });
    };

    handleReduce = () => {
      this.setState({ expanded: false });
    };

    render () {
      let TABLE = 'User';
      let columnsData = ['createdAt', 'expires', 'username'];
      return (
        <div>
          <div className='method'>
            <a id='CloudUser-constructor' name='CloudObject-constructor' className='section-anchor' />
            <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
              <CardHeader
                title='Instantiate a CloudUser'
                actAsExpander
                showExpandableButton
                style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
              />
              <CardMedia>
                {/* overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        > */}
                <div className='method-example' id='api-summary-example'>
                  <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_initiateUser')} />
                  <pre id='pre_initiateUser'>
                    <span className='code-red'>{`var`}</span>{` obj = `}<span className='code-red'>{`new`}</span>{` CB.CloudUser();`}
                  </pre>
                </div>{/* method-example */}
              </CardMedia>
              <CardTitle title='Constructor : CloudUser()' expandable subtitle='Instantiates a CloudUser object.' />
              <CardText expandable>
                <div className='method-description'>
                  <div className='method-list'>
                    <h6>Argument</h6>
                    <p>It takes no argument.</p>
                    <h6>Returns</h6>
                    <p>void</p>
                  </div>
                </div>
              </CardText>
            </Card>
            <a id='CloudUser-signup' name='CloudObject-set' className='section-anchor' />
            <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
              <CardHeader
                title='Sign Up a new User'
                actAsExpander
                showExpandableButton
                style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
              />
              <CardMedia>
                {/* overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        > */}
                <div className='method-example' id='api-summary-example'>
                  <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_signUp')} />
                  <pre id='pre_signUp'>
                    {
                      `//create a new user.
`}<span className='code-red'>{`var`}</span>{` user = `}<span className='code-red'>{`new`}</span>{` CB.CloudUser(`}<span className='code-yellow'>{`"${TABLE}"`}</span>{`); 
user.set(`}<span className='code-yellow'>{`"${columnsData[0].name}", "${columnsData[0].value}"`}</span>{`);
user.set(`}<span className='code-yellow'>{`"${columnsData[1].name}", "${columnsData[1].value}"`}</span>{`);
user.set(`}<span className='code-yellow'>{`"${columnsData[2].name}", "${columnsData[2].value}"`}</span>{`);
user.signUp({
success:`}<span className='code-red'>{`function`}</span>{`(user) {
    //Registration successfull
},
error: `}<span className='code-red'>{`function`}</span>{`(err) {
    //Error in user registration.
}
});`

                    }
                  </pre>
                </div>{/* method-example */}
              </CardMedia>
              <CardTitle title='CloudUser.signUp( [callback] )' expandable subtitle='Registers new user given its username, email and password. ' />
              <CardText expandable>
                <div className='method-description'>
                  <div className='method-list'>
                    <h6>Arguments</h6>
                    <dl className='argument-list'>
                      <dt>callback</dt>
                      <dd className>Object <span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                      <div className='clearfix' />
                    </dl>
                    <h6>Returns</h6>
                    <p>It returns a CloudUser object which has the user information if registration is successful otherwise an error object along with JQuery promise (if callback is not provided).</p>
                  </div>
                </div>
              </CardText>
            </Card>
            <a id='CloudUser-login' name='CloudObject-get' className='section-anchor' />
            <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
              <CardHeader
                title='Login a User'
                actAsExpander
                showExpandableButton
                style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
              />
              <CardMedia>
                {/* overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        > */}
                <div className='method-example' id='api-summary-example'>
                  <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_login')} />
                  <pre id='pre_login'>
                    {
                      `//login a user.
`}<span className='code-red'>{`var`}</span>{` user = `}<span className='code-red'>{`new`}</span>{` CB.CloudUser(`}<span className='code-yellow'>{`"${TABLE}"`}</span>{`); 
user.set(`}<span className='code-yellow'>{`"${columnsData[0].name}", "${columnsData[0].value}"`}</span>{`);
user.set(`}<span className='code-yellow'>{`"${columnsData[1].name}", "${columnsData[1].value}"`}</span>{`);
user.logIn({
success:`}<span className='code-red'>{`function`}</span>{`(user) {
    //Registration successfull
},
error: `}<span className='code-red'>{`function`}</span>{`(err) {
    //Error in user registration.
}
});`

                    }
                  </pre>
                </div>{/* method-example */}
              </CardMedia>
              <CardTitle title='CloudUser.logIn( [callback] )' expandable subtitle='Logins user given its username and password.' />
              <CardText expandable>
                <div className='method-description'>
                  <div className='method-list'>
                    <h6>Argument</h6>
                    <dl className='argument-list'>
                      <dt>callback</dt>
                      <dd className>Object<span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                      <div className='clearfix' />
                    </dl>
                    <h6>Returns</h6>
                    <p>It returns a CloudUser object which has the user information if registration is successful otherwise an error object along with JQuery promise (if callback is not provided).</p>
                  </div>
                </div>
              </CardText>
            </Card>
          </div>
        </div>
      );
    }
}

export default CloudUser;
