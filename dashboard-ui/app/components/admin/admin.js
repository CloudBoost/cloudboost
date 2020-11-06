import React from 'react';
import Proptypes from 'prop-types';
import { connect } from 'react-redux';
import {
  showAlert,
  getUsersBySkipLimit,
  updateUserActive,
  updateUserRole,
  deleteUser,
  addUser,
  getServerSettings,
  upsertAPI_URL as upsertApiUrl
} from '../../actions';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Col, FormGroup, FormControl, Form, Button, ControlLabel, HelpBlock } from 'react-bootstrap';
import Delete from 'material-ui/svg-icons/action/delete';
import Toggle from 'material-ui/Toggle';
import { grey500 } from 'material-ui/styles/colors';

export class Admin extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      email: '',
      name: '',
      password: '',
      myURL: ''
    };
  }

  componentWillMount () {
    if (this.props.isAdmin) {
      if (this.props.userList.length === 0) {
        this.props.getUsersBySkipLimit(0, 20, []);
      } else {
        getServerSettings().then((data) => {
          this.setState({ myURL: data.data.myURL });
        }, () => {
          showAlert('error', 'Cannot fetch server details.');
        });
      }
    } else {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    }
  }

  static get contextTypes () {
    return {
      router: React.PropTypes.object.isRequired
    };
  }

  changeUserActive = userId => (e, val) => {
    this.props.updateUserActive(userId, val);
  }

  changeUserRole = userId => e => {
    let val = e.target.value === 'Admin';
    this.props.updateUserRole(userId, val);
  }

  deleteUser = (userId) => () => {
    this.props.deleteUser(userId);
  }

  addUser = (e) => {
    e.preventDefault();
    this.props.addUser(this.state.name, this.state.email, this.state.password, false);
    this.setState({
      email: '',
      name: '',
      password: ''
    });
  }

  changeURL = () => {
    if (this.state.myURL) {
      this.props.upsertApiUrl(this.state.myURL);
    } else {
      showAlert('error', 'Please nter a valid URL');
    }
  }

  changeHandler = which => e => {
    this.state[which] = e.target.value;
    this.setState(this.state);
  }

  render () {
    return (
      <div className='admin tables'>
        <div className='adminContainer'>

          <div className='push-box' style={{ marginTop: 15, width: '100%', marginBottom: 50 }}>
            <div style={{
              width: '100%',
              backgroundColor: '#FFF',
              borderBottom: '1px solid #C4C2C2'
            }}>
              <div className='container' style={{ padding: 15 }}>
                <Form horizontal>
                  <FormGroup style={{ marginBottom: 0 }}>
                    <Col sm={5}>
                      <ControlLabel>
                                                API URL
                      </ControlLabel>
                      <HelpBlock validationState='error'
                        style={{ fontSize: 13, lineHeight: '1.2', color: 'red' }}>
                                                This is the login and sign up page that you can use for your app.
                      </HelpBlock>
                    </Col>
                    <Col sm={5}>
                      <FormControl type='text'
                        value={this.state.myURL}
                        onChange={this.changeHandler('myURL')} />
                    </Col>
                    <Col sm={2}>
                      <Button bsStyle='primary' onClick={this.changeURL} > Change </Button>
                    </Col>
                  </FormGroup>
                  <FormGroup style={{ marginBottom: 0 }}>
                    <Col sm={5}>
                      <ControlLabel>
                                                Allow Other Developers to sign up?
                      </ControlLabel>
                    </Col>
                    <Col smOffset={5} sm={2}>
                      <Toggle />
                    </Col>
                  </FormGroup>
                </Form>
              </div>
            </div>
          </div>

          <div className='adduserdiv'>
            <h3 style={{
              textAlign: 'center',
              marginBottom: 15,
              color: '#353446',
              fontSize: 16,
              fontWeight: 500
            }}>
                            Add User
            </h3>
            <form onSubmit={this.addUser}>
              <input
                placeholder='Name'
                className='adminninputs'
                type='text'
                onChange={this.changeHandler('name')}
                value={this.state.name}
                required
              />
              <input
                placeholder='Email'
                className='adminninputs'
                type='email'
                onChange={this.changeHandler('email')}
                value={this.state.email}
                required
              />
              <input
                placeholder='Password'
                className='adminninputs'
                type='password'
                onChange={this.changeHandler('password')}
                value={this.state.password}
                required
              />
              <btn className='btn btn-primary passwordsubmitbtn' type='submit'>Add User</btn>
            </form>
          </div>

          <div className='tablecontainer'>
            {
              this.props.loading

                ? <RefreshIndicator
                  size={50}
                  left={70}
                  top={0}
                  status='loading'
                  className='loaderadinsettings'
                />
                : <Table selectable={false} multiSelectable={false}>
                  <TableHeader displaySelectAll={false}
                    adjustForCheckbox={false}
                    enableSelectAll={false}
                    style={{
                      padding: 15,
                      fontSize: 16,
                      fontWeight: 500
                    }}>
                    <TableRow>
                      <TableHeaderColumn>S.No</TableHeaderColumn>
                      <TableHeaderColumn>User Name</TableHeaderColumn>
                      <TableHeaderColumn>Role</TableHeaderColumn>
                      <TableHeaderColumn>Active ?</TableHeaderColumn>
                      <TableHeaderColumn>Remove</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                    {
                      this.props.userList.map((user, i) => {
                        return <TableRow key={i}>
                          <TableRowColumn><span>{ i + 1 }</span></TableRowColumn>
                          <TableRowColumn><span>{ user.name }</span></TableRowColumn>
                          <TableRowColumn>
                            <select className='adminroleseelct'
                              value={user.isAdmin ? 'Admin' : 'User'}
                              onChange={this.changeUserRole(user._id)}>
                              <option value='Admin'>Admin</option>
                              <option value='User'>User</option>
                            </select>
                          </TableRowColumn>
                          <TableRowColumn>
                            <Toggle
                              toggled={user.isActive}
                              className={'adminactivetoggle'}
                              onToggle={this.changeUserActive(user._id)}
                            />
                          </TableRowColumn>
                          <TableRowColumn style={{ paddingTop: 6 }}>
                            <Delete color={grey500}
                              onClick={this.deleteUser(user._id)}
                              style={{ cursor: 'pointer' }} />
                          </TableRowColumn>
                        </TableRow>;
                      })
                    }
                  </TableBody>
                </Table>
            }
          </div>
        </div>
      </div>
    );
  }
}

Admin.propTypes = {
  isAdmin: Proptypes.bool,
  userList: Proptypes.array,
  getUsersBySkipLimit: Proptypes.func,
  updateUserActive: Proptypes.func,
  updateUserRole: Proptypes.func,
  addUser: Proptypes.func,
  deleteUser: Proptypes.func,
  upsertApiUrl: Proptypes.func,
  loading: Proptypes.bool
};

const mapStateToProps = (state) => {
  let userList = [];
  let isAdmin = false;
  if (state.user.user) {
    isAdmin = state.user.user.isAdmin;
  }
  if (Object.keys(state.userList).length) {
    userList = Object.keys(state.userList).map((user) => {
      return state.userList[user];
    });
  }
  return {
    currentUser: state.user,
    loading: state.loader.loading,
    userList: userList,
    isAdmin
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUsersBySkipLimit: (skip, limit, skipUserIds) => dispatch(getUsersBySkipLimit(skip, limit, skipUserIds)),
    updateUserActive: (userId, isActive) => dispatch(updateUserActive(userId, isActive)),
    updateUserRole: (userId, isAdmin) => dispatch(updateUserRole(userId, isAdmin)),
    deleteUser: (userId) => dispatch(deleteUser(userId)),
    addUser: (name, email, password, isAdmin) => dispatch(addUser(name, email, password, isAdmin)),
    upsertApiUrl: (apiURL) => dispatch(upsertApiUrl(apiURL))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
