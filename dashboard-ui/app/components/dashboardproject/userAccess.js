/**
 * Created by Darkstar on 12/4/2016.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Close from 'material-ui/svg-icons/navigation/close';
import { grey500, grey300 } from 'material-ui/styles/colors';
import {
  sendInvitation,
  fetchDevDetails,
  deleteDev,
  deleteInvite,
  changeDeveloperRole,
  fetchApps
} from '../../actions/index';
import { FormGroup, InputGroup, FormControl, Button, Clearfix, Table } from 'react-bootstrap';
import { RefreshIndicator } from 'material-ui';
import Loader from 'react-dots-loader';
import 'react-dots-loader/index.css';

const iconStyles = {
  marginLeft: 20,
  cursor: 'pointer'
};
const iconStylesDisabled = {
  marginLeft: 20,
  cursor: 'no-drop'
};
const style = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    background: 'none',
    boxShadow: 'none',
    marginLeft: '18px',
    marginRight: '18px'
  }
};

export class UserAccess extends Component {
  static propTypes = {
    fetchDevDetails: PropTypes.any,
    devIdArray: PropTypes.any,
    changeDeveloperRole: PropTypes.any,
    appId: PropTypes.any,
    loading: PropTypes.any,
    currentUser: PropTypes.any,
    developerList: PropTypes.any,
    invited: PropTypes.any,
    onDeleteDev: PropTypes.any,
    onDeleteInvite: PropTypes.any,
    invite: PropTypes.any
  }
  componentWillMount () {
    this.props.fetchDevDetails(this.props.devIdArray);
  }

  changeDevRole = (userId) => (e) => {
    this.props.changeDeveloperRole(this.props.appId, userId, e.target.value);
  }

  constructor (props) {
    super(props);
    this.state = {
      email: ''
    };
  }

  handleKeyChange = (e) => {
    if (e.keyCode === 13) {
      this.setState({ email: '' });
      return this.props.invite(this.props.appId, this.state.email);
    }
  }

  render () {
    const handleChange = (e) => this.setState({ email: e.target.value });
    const onSend = () => {
      this.setState({ email: '' });
      return this.props.invite(this.props.appId, this.state.email);
    };

    return (
      <div className='tab-content'>
        <Table responsive>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Remove</th>
            </tr>
          </thead>
          {
            this.props.loading.modal_loading
              ? <tbody>
                <tr>
                  <td colSpan='3'>
                    <RefreshIndicator size={30}
                      left={3}
                      top={3}
                      status='loading'
                      style={{ marginLeft: '60%', position: 'relative' }}
                      className='profileimageloader'
                    />
                  </td>
                </tr>
              </tbody>
              : <tbody>
                {
                  this.props.developerList.map((user) => <tr key={user._id}>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={this.props.currentUser.user._id === user._id ? 'roleselectdevdisabled' : 'roleselectdev'}
                        defaultValue={user.role}
                        disabled={this.props.currentUser.user._id === user._id}
                        onChange={this.changeDevRole(user._id)}
                      >
                        <option value='Admin'>Admin</option>
                        <option value='User'>User</option>
                      </select>
                    </td>
                    <td>Accepted</td>
                    <td>
                      {
                        this.props.currentUser.user._id !== user._id
                          ? <Close style={iconStyles}
                            color={grey500}
                            onClick={() => this.props.onDeleteDev(this.props.appId, user._id)} />
                          : <Close style={iconStylesDisabled} color={grey300} />
                      }
                    </td>
                  </tr>)
                }
                {
                  this.props.invited.map((user) => <tr key={user.email}>
                    <td>{user.email}</td>
                    <td>--</td>
                    <td>Invited</td>
                    <td>
                      <Close style={iconStyles}
                        color={grey500}
                        onClick={() => this.props.onDeleteInvite(this.props.appId, user.email)} />
                    </td>
                  </tr>)
                }
              </tbody>
          }
        </Table>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>
              <i className='ion ion-ios-email email-icon' />
            </InputGroup.Addon>
            <FormControl type='text'
              placeholder='example@example.com'
              value={this.state.email}
              onChange={handleChange}
              onKeyUp={this.handleKeyChange} />
          </InputGroup>
          {
            this.props.loading.modal_loading
              ? <Button className='btn-primary create-btn ' disabled>
                <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
              </Button>
              : <Button className='btn-primary create-btn' onClick={onSend}>Invite</Button>
          }
        </FormGroup>
        <Clearfix />
      </div>
    );
  }
}

const mapStateToProps = (state, selfProps) => {
  let devIdArray = selfProps.developers.map(x => x.userId);
  let developerList = [];
  let isUserListFetched = false;
  if (Object.keys(state.userList).length) {
    isUserListFetched = Object.keys(state.userList).filter((x) => {
      return devIdArray.filter((y) => x === y).length;
    }).length >= devIdArray.length;
  }
  if (isUserListFetched) {
    developerList = selfProps.developers.map((dev) => {
      let devObj = state.userList[dev.userId];
      devObj.role = dev.role;
      return devObj;
    });
  }
  return { developerList: developerList, devIdArray: devIdArray, currentUser: state.user, loading: state.loader };
};

const mapDispatchToProps = (dispatch) => {
  return {
    invite: (appId, email) => dispatch(sendInvitation(appId, email)),
    fetchDevDetails: (devIdArray) => dispatch(fetchDevDetails(devIdArray)),
    onDeleteDev: (appId, userId) => dispatch(deleteDev(appId, userId)),
    onDeleteInvite: (appId, email) => dispatch(deleteInvite(appId, email)),
    changeDeveloperRole: (appId, userId, role) => dispatch(changeDeveloperRole(appId, userId, role)),
    fetchApps: () => dispatch(fetchApps())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAccess);
