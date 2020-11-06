/**
 * Created by Darkstar on 12/21/2016.
 */
/**
 * Created by Darkstar on 12/2/2016.
 */
'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { genClientKey, genMasterKey } from '../../actions';
import { FormGroup, InputGroup, FormControl, Clearfix } from 'react-bootstrap';
import ReactTooltip from 'react-tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';

export class Keys extends React.Component {
  static propTypes = {
    appId: PropTypes.any,
    masterKey: PropTypes.any,
    clientKey: PropTypes.any,
    onGenClientKey: PropTypes.any,
    onGenMasterKey: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      buttonState: false
    };
  }
  copyText = (field) => () => {
    this.state = {};
    this.state[field] = true;
    this.setState(this.state);
  }
  render () {
    return (
      <div className='tab-content'>
        <FormGroup validationState={this.state.appIdCopied
          ? 'success'
          : null}>
          <label>App ID</label><br />
          <label className='label-description'>This is your App's unique ID.</label>&nbsp;
          <label className={this.state.appIdCopied
            ? 'copy-span'
            : 'hide'}>Copied!</label>

          <InputGroup>
            <FormControl type='text' value={this.props.appId} disabled />
            <InputGroup.Addon className='input-addon'>
              <CopyToClipboard text={this.props.appId} onCopy={this.copyText('appIdCopied')}>
                <i className='fa fa-copy' />
                {/* <img src="public/assets/images/copy-icon.png" className="copy-icon"/> */}
              </CopyToClipboard>
            </InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <FormGroup validationState={this.state.masterKeyCopied
          ? 'success'
          : null}>
          <label htmlFor='firstName'>Master Key</label><br />
          <label className='label-description'>Master Key ignores all security rules. Use this on the server and not on the client.</label>
          <label className={this.state.masterKeyCopied
            ? 'copy-span'
            : 'hide'}>Copied!</label>

          <InputGroup>
            <FormControl type='text' value={this.props.masterKey} disabled />

            <InputGroup.Addon style={{ borderLeft: 'none' }}>
              <CopyToClipboard text={this.props.masterKey} onCopy={this.copyText('masterKeyCopied')}>
                <i className='fa fa-copy' />
              </CopyToClipboard>
            </InputGroup.Addon>
            <InputGroup.Addon onClick={() => this.props.onGenMasterKey(this.props.appId)}>
              <i className='ion ion-android-sync new-icon' />
            </InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <FormGroup validationState={this.state.clientKeyCopied
          ? 'success'
          : null}>
          <label htmlFor='firstName'>Client Key</label><br />
          <label className='label-description'>Client Key can be public. You can use this on the client.</label>&nbsp;
          <label className={this.state.clientKeyCopied
            ? 'copy-span'
            : 'hide'}>Copied!</label>

          <InputGroup>
            <FormControl type='text' value={this.props.clientKey} disabled />
            <InputGroup.Addon style={{ borderLeft: 'none' }}>
              <CopyToClipboard text={this.props.clientKey} onCopy={this.copyText('clientKeyCopied')}>
                <i className='fa fa-copy copy-icon' />
              </CopyToClipboard>
            </InputGroup.Addon>
            <InputGroup.Addon onClick={() => this.props.onGenClientKey(this.props.appId)}>
              <i className='ion ion-android-sync new-icon' />
            </InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <Clearfix />
        <ReactTooltip place='bottom' type='info' />

      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGenMasterKey: (appId) => {
      dispatch(genMasterKey(appId));
    },
    onGenClientKey: (appId) => {
      dispatch(genClientKey(appId));
    }
  };
};

export default connect(null, mapDispatchToProps)(Keys);
