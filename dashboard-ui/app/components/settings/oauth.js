import React from 'react';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ActionInfo from 'material-ui/svg-icons/action/info';
import FileFolder from 'material-ui/svg-icons/file/folder';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';

class OAuth extends React.Component {
  constructor () {
    super();
    this.state = {
      show: false,
      hide: true
    };
  }

  componentDidMount () {
    var urlString = window.location.href;
    var url = new URL(urlString);
    var code = url.searchParams.get('code');
    var redirectUri = url.searchParams.get('redirect_uri');
    var clientId = url.searchParams.get('client_id');
    if (clientId === '78345213') {
      this.setState({ show: true, code: code, redirectUri: redirectUri });
      window.history.pushState('object or string', 'Title', 'oauthaccess');
    } else {
      window.location.href = window.DASHBOARD_BASE_URL;
    }
  }

  redirectBack = (method) => () => {
    if (method === 'cancel') {
      window.location.href = this.state.redirectUri + '?error=access_denied';
      return;
    }
    window.location.href = this.state.redirectUri + '?code=' + this.state.code;
  }

  render () {
    var retScreen = this.state.show
      ? <Card style={{
        marginLeft: '32%',
        width: '40%',
        marginTop: '180px',
        height: '45vw',
        padding: '10px'
      }}>
        <CardHeader
          titleStyle={{
            fontSize: '18px',
            color: '#2196f3'
          }}
          title='CloudBoost'
          subtitle='cloudboost.io'
          avatar='https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518'
        />
        <CardHeader subtitle='Hi, zapier.com would like to,' />
        <CardText>
          <List>
            <ListItem
              style={{
                color: '#7D7D7D',
                fontWeight: '490',
                fontSize: '16px'
              }} disabled primaryText='Access your profile.' leftIcon={<ActionInfo />} />
            <ListItem
              style={{
                color: '#7D7D7D',
                fontWeight: '490',
                fontSize: '16px'
              }} disabled primaryText='Access your application details.' leftIcon={<ContentInbox />} />
            <ListItem style={{
              color: '#7D7D7D',
              fontWeight: '490',
              fontSize: '16px'
            }} disabled primaryText='Access your application database.' leftIcon={<FileFolder />} />
          </List>
        </CardText>
        <CardHeader
          titleStyle={{
            fontSize: '10px'
          }}
          subtitle='Allow zapier.com to do this?'
        />
        <CardActions style={{}}>
          <button className='btn btn-primary pull-right' onClick={this.redirectBack('allow')}>
                        Allow
          </button>
          <button className='btn btn-default pull-right' onClick={this.redirectBack('cancel')}>
                        Deny
          </button>
        </CardActions>
      </Card>
      : null;

    return retScreen;
  }
}

export default OAuth;
