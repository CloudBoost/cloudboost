import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'brace/mode/json';
import 'brace/theme/github';
import { updateQueueMessage } from '../../actions';
import { Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import AceEditor from 'react-ace';
import Datetime from 'react-datetime';
import moment from 'moment';

export class EditMessage extends React.Component {
  static propTypes = {
    closeEditMessageModal: PropTypes.any,
    messageData: PropTypes.any,
    updateQueueMessage: PropTypes.any,
    selectedQueue: PropTypes.any,
    showEditMessageModal: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      messageType: 'text',
      jsonValue: '',
      textValue: '',
      timeout: '',
      delay: '',
      expires: null,
      expiresISO: '',
      expireError: false
    };
  }

    close = () => {
      this.setState({
        messageType: 'text',
        jsonValue: '',
        textValue: '',
        timeout: '',
        delay: '',
        expires: null,
        expiresISO: '',
        expireError: false
      });

      this.props.closeEditMessageModal();
    };

    componentDidMount () {
      let state = {};

      try {
        JSON.parse(this.props.messageData.message);
        state.messageType = 'json';
        state.jsonValue = this.props.messageData.message;
      } catch (e) {
        state.messageType = 'text';
        state.textValue = this.props.messageData.message;
      }

      state.timeout = this.props.messageData.timeout || '';
      state.delay = this.props.messageData.delay || '';
      state.expires = this.props.messageData.expires ? new Date(this.props.messageData.expires) : null;
      state.expiresISO = this.props.messageData.expires ? moment(this.props.messageData.expires).toISOString() : null;
      this.setState(state);
    }

    handleChangeMessageType = (event) => this.setState({ messageType: event.target.value });

    messageChangeHandler = (which) => (newValue) => {
      this.state[which] = newValue.target ? newValue.target.value : newValue;
      this.setState(this.state);
    }

    delayTmeoutChangeHandler = (which) => (e, newValue) => {
      this.state[which] = newValue;
      this.setState(this.state);
    }

    expiresChangeHandler = (momentObj) => {
      this.setState({
        expires: momentObj.format('YYYY-MM-DD HH:mm:ss'),
        expiresISO: momentObj.toISOString()
      });
    }

    updateMessage = (e) => {
      let currentTime = moment();
      let expiryTime = moment(this.state.expiresISO);

      let isafter = expiryTime.isAfter(currentTime);

      if (isafter || this.state.expires === null) {
        if (this.state.messageType === 'text') { this.props.messageData.message = this.state.textValue; } else { this.props.messageData.message = this.state.jsonValue; }

        this.props.messageData.expires = this.state.expiresISO;
        this.props.messageData.delay = this.state.delay;
        this.props.messageData.timeout = this.state.timeout;

        this.props.updateQueueMessage(this.props.selectedQueue, this.props.messageData);
        this.close();
      } else {
        this.setState({ expireError: true });
      }
    }

    render () {
      return (
        <Modal className='addMessageModal'
          show={this.props.showEditMessageModal}
          onHide={this.close}
          dialogClassName='custom-modal modal-reduce-margin-top'>
          <Modal.Header>
            <Modal.Title>
              <span className='modal-title-style'>Edit Message</span>
              <i className='fa fa-exchange modal-icon-style pull-right' />
              <div className='modal-title-inner-text'>
                            Modify your message
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId='formControlsSelect'>
              <ControlLabel>Message Datatype</ControlLabel>
              <FormControl componentClass='select'
                value={this.state.messageType}
                onChange={this.handleChangeMessageType}
                style={{ width: '50%' }}>
                <option value='text'>Text</option>
                <option value='json'>JSON</option>
              </FormControl>
            </FormGroup>
            {
              this.state.messageType === 'text'
                ? <FormGroup>
                  <ControlLabel>Message</ControlLabel>
                  <FormControl
                    componentClass='textarea'
                    rows='4'
                    cols='50'
                    placeholder='please enter message here...'
                    onChange={this.messageChangeHandler('textValue')}
                    value={this.state.textValue}
                  />
                </FormGroup>
                : <AceEditor mode='json'
                  theme='github'
                  onChange={this.messageChangeHandler('jsonValue')}
                  value={this.state.jsonValue}
                  name='json'
                  className='jsonmodal'
                  setOptions={{ wrapBehavioursEnabled: true }}
                  minLines={5}
                  style={{ width: '100%' }}
                />
            }
            <FormGroup style={{ width: '50%' }}>
              <ControlLabel>Timeout</ControlLabel>
              <FormControl
                type='text'
                onChange={this.delayTmeoutChangeHandler('timeout')}
                value={this.state.timeout}
              />
            </FormGroup>

            <FormGroup style={{ width: '50%' }}>
              <ControlLabel>Delay</ControlLabel>
              <FormControl
                type='numbers'
                onChange={this.delayTmeoutChangeHandler('delay')}
                value={this.state.delay}
              />
            </FormGroup>

            <FormGroup style={{ width: '50%' }} validationState={this.state.expireError ? 'error' : null}>
              <ControlLabel>Expires</ControlLabel>
              <Datetime className='datetime-picker'
                dateFormat='YYYY-MM-DD'
                timeFormat='HH:mm:ss'
                onChange={this.expiresChangeHandler}
                defaultValue={this.state.expiresISO}
              />
              {
                this.state.expireError &&
                  <HelpBlock style={{ fontSize: 14, margin: 0 }}>Invalid expiry date</HelpBlock>
              }
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Cancel</Button>
            <Button bsStyle='primary' onClick={this.updateMessage}>Save</Button>
          </Modal.Footer>
        </Modal>
      );
    }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateQueueMessage: (selectedQueue, selectedMessage) => dispatch(updateQueueMessage(selectedQueue, selectedMessage))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditMessage);
