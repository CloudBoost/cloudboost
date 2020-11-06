/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateSettings, fetchTables, fetchToken, fetchEvents, fetchChannels } from '../../actions';
import { appSettings } from '../../config';

import { Button, InputGroup, FormControl } from 'react-bootstrap';
import Toggle from 'material-ui/Toggle';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import MenuItem from 'material-ui/MenuItem';

export class IntegrationSettings extends React.Component {
  static propTypes = {
    fetchEvents: PropTypes.any,
    tables: PropTypes.any,
    onLoad: PropTypes.any,
    activeAppId: PropTypes.any,
    masterKey: PropTypes.any,
    integrationSettings: PropTypes.any,
    appData: PropTypes.any,
    fetchToken: PropTypes.any,
    events: PropTypes.any,
    renderComponent: PropTypes.any,
    channels: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = { slack_events: [], loading: true, ...appSettings.integrationSettings.settings, event_names: ['Create', 'Update', 'Delete'], zapier_events: [] };
  }

  componentWillMount () {
    this.props.fetchEvents('_Event', 'name');
    if (this.props.tables.length === 0) {
      this.props.onLoad(this.props.activeAppId, this.props.masterKey);
    }
    if (this.props.integrationSettings) {
      this.setState({ loading: false, ...this.props.integrationSettings.settings });
    } else if (this.props.integrationSettings === null) {
      this.setState({ loading: false });
    }
  }

  isEmpty (obj) {
    if (obj == null) return true;
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;
    if (typeof obj !== 'object') return true;
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  }

  componentDidMount () {
    var urlString = window.location.href;
    var url = new URL(urlString);
    var code = url.searchParams.get('code');
    if (code) {
      var myNewURL = this.props.appData.appId + '/settings';// the new URL
      window.history.pushState('object or string', 'Title', '/' + myNewURL);
      this.props.fetchToken(this.props.appData.appId, this.props.appData.masterKey, 'integrations', this.state, code);
    }
  }

  componentWillReceiveProps (nextProps) {
    var $this = this;
    if (nextProps.integrationSettings) {
      this.setState({ loading: false, ...nextProps.integrationSettings.settings });
    } else if (this.props.integrationSettings === null) {
      this.setState({ loading: false });
    }
    if (!this.isEmpty(nextProps.integrationSettings)) {
      this.setState({ channel: nextProps.integrationSettings.settings.channel, accessToken: !$this.isEmpty(nextProps.integrationSettings.settings.slack.oauth_response) ? nextProps.integrationSettings.settings.slack.oauth_response.data.accessToken : '' }, function () {
        if ($this.isEmpty($this.props.channels) && !$this.isEmpty($this.state.accessToken)) {
          $this.props.fetchChannels('https://slack.com/api/channels.list', $this.state.accessToken);
        }
      });
    }
    if (!this.isEmpty(this.state.slack.events)) {
      this.state.slack_events = this.state.slack.slack_events ? this.state.slack.slack_events : [];
      this.setState(this.state);
    }
    if (!this.isEmpty(this.state.zapier_events)) {
      this.state.zapier_events = this.state.zapier.zapier_events ? this.state.zapier.zapier_events : [];
      this.setState(this.state);
    }
  }

  textChangeHandler = (which, sub) => (e) => {
    this.state[which][sub] = e.target.value;
    this.setState(this.state);
  }

  toggleChangeHandler = (which, sub) => (e, val) => {
    this.state[which][sub] = val;
    this.setState(this.state);
  }

  toggleChangeHandler2 = (which, sub) => () => {
    this.state[which][sub] = !this.state[which][sub];
    this.setState(this.state);
  }

  toggleChangeHandler3 = (which, sub) => () => {
    this.state[which][sub].notify = !this.state[which][sub].notify;
    this.setState(this.state);
  }

  toggleChangeHandler4 = (sub, eventItem) => () => {
    this.state.zapier_events[sub][eventItem] = !this.state.zapier_events[sub][eventItem];
    this.setState(this.state);
  }

  updateSettings = () => {
    var $this = this;
    this.setState({ loading: true });
    for (var i = 0; i < this.state.slack_events.length; i++) {
      this.state.slack[this.state.slack_events[i].event_name] = { notify: this.state.slack_events[i].notify, channel_name: this.state.slack_events[i].channel_name };
    }
    this.state['zapier'].zapier_events = this.state.zapier_events;
    this.setState(this.state, function () {
      $this.props.updateSettings($this.props.appData.appId, $this.props.appData.masterKey, 'integrations', $this.state);
    });
  }

    _handleChange = (index, value, type) => {
      this.state.slack_events[index][type] = value;
      this.setState(this.state);
    };

    _handleChange3 = (index, value) => {
      this.state.zapier_events[index].tableName = value;
      this.setState(this.state);
    };

    addEvent = (val) => {
      if (this.state.slack_events.length >= this.props.events.length) return;
      this.state.slack_events.push({ notify: true, event_name: null, channel_name: null });
      this.setState(this.state);
    }

    addTable = () => {
      if (this.state.zapier_events.length >= this.props.tables.length) return;
      this.state.zapier_events[this.state.zapier_events.length] = { tableName: null, 'Create': true, 'Update': true, 'Delete': true };
      this.setState(this.state);
    }

    render () {
      if (!this.props.renderComponent) { return <br />; } else if (this.state.loading) {
        return <RefreshIndicator
          size={40}
          left={-33}
          top={106}
          status='loading'
          style={{ marginLeft: '50%', position: 'relative' }}
        />;
      } else {
        var $this = this;
        var items = [<MenuItem value={'#'} primaryText={'Select #event'} disabled />]; var channelList = [<MenuItem value={'#'} primaryText={'Select #channel to post to'} disabled />];
        for (let i = 0; i < this.props.events.length; i++) {
          items.push(<MenuItem value={this.props.events[i]} key={i} primaryText={this.props.events[i]} />);
        }
        for (let i = 0; i < this.props.channels.length; i++) {
          channelList.push(<MenuItem value={this.props.channels[i].name} key={i} primaryText={'#' + this.props.channels[i].name} />);
        }
        var triggerTables = [<MenuItem value={'#'} primaryText={'Select Table'} disabled />];
        if (typeof this.props.tables !== 'undefined' && (this.props.tables.length > 0 || this.props.tables.length === undefined)) {
          for (let i = 0; i < this.props.tables.length; i++) {
            triggerTables.push(<MenuItem value={this.props.tables[i].name} key={i} primaryText={this.props.tables[i].name} />);
          }
        }
        return (
          <div style={{ paddingTop: 41, paddingLeft: 54 }}>
            <h2 className='head'>Integration Settings</h2>
            <div>
              <div className='small-form-row'>
                <div className='control-label'>
                  <label className='danger'>
                    <span className='icon-align'>
                      <i className='fa fa-slack icon'
                        aria-hidden='true' />
                    </span>
                                    &nbsp; Slack
                  </label>
                </div>
                <div className='control'>
                  <div>
                    <table className='table table-ionic table-action table-social'>
                      <tbody>
                        <tr className='single-row'>
                          <td colSpan={2} />
                          <td />
                          <td />
                          <td className='row-actions'>
                            <li className='setup'
                              onClick={this.toggleChangeHandler2('slack', 'enabled')}>
                              {this.state.slack.enabled ? 'Disable' : 'setup'}
                            </li>
                          </td>
                        </tr>
                        <tr className={this.state.slack.enabled ? 'config-row' : 'hide'}>
                          <td colSpan={12} className='' style={{ padding: 0 }}>
                            <div className='config-container'>
                              <div className='small-form-row'>
                                <div className='control-label'>
                                  <label className='danger'>
                                                                    Add CloudBoost on Slack
                                  </label>
                                  <p className='label-desc'>
                                                                    To add CB App on Slack
                                  </p>
                                </div>
                                <div className='control'>
                                  <a href={'https://slack.com/oauth/authorize?&client_id=3133949145.212145423984&scope=channels:read+chat:write:bot&redirect_uri=' + global.DASHBOARD_URL + '/' + this.props.appData.appId + '/settings'}><img alt='Add to Slack' height='40' width='139' src='https://platform.slack-edge.com/img/add_to_slack.png' srcSet='https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x' /></a>
                                </div>
                              </div>

                              {
                                this.props.events.length > 0
                                  ? <div>{
                                    this.state.slack_events.map(function (item, index) {
                                      return (<div className='small-form-row'>
                                        <div className='control-label'>
                                          <div className='control-label'>
                                            <label className='danger'>
                                                                                        Add Event
                                            </label>
                                            <p className='label-desc'>
                                                                                        Event Notifications
                                            </p>
                                          </div>
                                        </div>
                                        <div className='control'>
                                          <Toggle className='togglegeneral'
                                            onToggle={$this.toggleChangeHandler3('slack_events', index)}
                                            toggled={$this.state.slack_events[index] ? $this.state.slack_events[index].notify : true}
                                          />
                                          <DropDownMenu maxHeight={300} value={$this.state.slack_events[index].event_name ? $this.state.slack_events[index].event_name : '#'} onChange={(e, i, value) => $this._handleChange(index, value, 'event_name')}>
                                            {items}
                                          </DropDownMenu>
                                          <br />
                                          <DropDownMenu maxHeight={300} value={$this.state.slack_events[index].channel_name ? $this.state.slack_events[index].channel_name : '#'} onChange={(e, i, value) => $this._handleChange(index, value, 'channel_name')}>
                                            {channelList}
                                          </DropDownMenu>
                                        </div>

                                      </div>);
                                    })
                                  }
                                  <div> {/* eslint-disable-line */ }
                                    <Button style={{ marginTop: 15 }}
                                      className='btn-primary'
                                      onClick={this.addEvent}
                                    >
                                                                            Add
                                    </Button>
                                  </div>
                                  </div>
                                  : <div>No Events have been added!! To add one please check CloudEvent in Quick Docs Drawer</div>
                              }
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className='small-form-row'>
                <div className='control-label'>
                  <label className='danger'>
                    <span className='icon-align'>
                      <i className='fa fa-slack icon'
                        aria-hidden='true' />
                    </span>
                                    &nbsp; Zapier
                  </label>
                </div>
                <div className='control'>
                  <div>
                    <table className='table table-ionic table-action table-social'>
                      <tbody>
                        <tr className='single-row'>
                          <td colSpan={2} />
                          <td />
                          <td />
                          <td className='row-actions'>
                            <li className='setup'
                              onClick={this.toggleChangeHandler2('zapier', 'enabled')}>
                              {this.state.zapier.enabled ? 'Disable' : 'setup'}
                            </li>
                          </td>
                        </tr>
                        <tr className={this.state.zapier.enabled ? 'config-row' : 'hide'}>
                          <td colSpan={12} className='' style={{ padding: 0 }}>
                            <div className='config-container'>
                              <div className='small-form-row'>
                                <div className='control-label'>
                                  <label className='danger'>
                                                                    WebHook URL
                                  </label>
                                  <p className='label-desc'>
                                                                    This is the URL of Zapier
                                  </p>
                                </div>
                                <div className='control'>
                                  <div>
                                    <InputGroup>
                                      <FormControl type='text'
                                        placeholder='Enter URL'
                                        value={this.state.zapier.webhook_url}
                                        onChange={this.textChangeHandler('zapier', 'webhook_url')}
                                      />
                                    </InputGroup>
                                  </div>
                                </div>
                              </div>
                              <div>
                                {
                                  this.state.zapier_events.map(function (item, index) {
                                    return (<div className='small-form-row'>
                                      <div className='control-label'>
                                        <div className='control-label'>
                                          <label className='danger'>
                                                                                Table
                                          </label>
                                          <p className='label-desc'>
                                                                                Event Notifications
                                          </p>
                                        </div>
                                      </div>
                                      <div className='control'>
                                        <DropDownMenu maxHeight={300} value={$this.state.zapier_events[index].tableName || '#'} onChange={(e, i, value) => $this._handleChange3(index, value)}>
                                          {triggerTables}
                                        </DropDownMenu>
                                        <br />
                                        <div>
                                          {$this.state.event_names.map(function (eventItem, eventIndex) {
                                            return (
                                              <Checkbox className='togglegeneral'
                                                label={eventItem} style={{ display: 'flex', flexDirection: 'row', marginRight: '-200px !important' }}
                                                onCheck={$this.toggleChangeHandler4toggleChangeHandler3(index, eventItem)}
                                                checked={$this.state.zapier_events[index] ? $this.state.zapier_events[index][eventItem] : true} labelPosition={'right'} />
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>);
                                  })}
                                <div>
                                  <Button style={{ marginTop: 15 }}
                                    className='btn-primary'
                                    onClick={this.addTable}
                                  >
                                                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className='small-form-row'>
                <div className='control'>
                  <div>
                    <Button style={{ marginTop: 15 }}
                      className='btn-primary'
                      onClick={this.updateSettings}
                    >
                                        Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
}

const mapStateToProps = (state) => {
  let tables = state.apps.filter(app => (app.appId === state.manageApp.appId))[0].tables;
  let integrationSettings = null;
  if (state.settings.length) {
    integrationSettings = state.settings.filter(x => x.category === 'integrations')[0];
  }
  return {
    appData: state.manageApp,
    response: state.response,
    masterKey: state.manageApp.masterKey,
    activeAppId: state.manageApp.appId,
    events: state.events,
    channels: state.channels,
    integrationSettings: integrationSettings,
    tables: tables
      ? tables
        .filter(
          t => t.name
            .toLowerCase()
            .search(state.manageApp.tableFilter ? state.manageApp.tableFilter : '') >= 0
        )
      : []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: (appId, masterKey) => dispatch(fetchTables(appId, masterKey)),
    updateSettings: (appId, masterKey, categoryName, settingsObject) => dispatch(updateSettings(appId, masterKey, categoryName, settingsObject)),
    fetchToken: (appId, masterKey, categoryName, settingsObject, code) => { return dispatch(fetchToken(appId, masterKey, categoryName, settingsObject, code, '74f22b43226a92ecc2e80b3abd29491b', '3133949145.212145423984')); },
    fetchEvents: (tableName, column) => dispatch(fetchEvents(tableName, column)),
    fetchChannels: (url, accessToken) => dispatch(fetchChannels(url, accessToken))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationSettings);
