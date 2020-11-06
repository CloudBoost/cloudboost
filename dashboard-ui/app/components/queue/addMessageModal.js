import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import Datetime from 'react-datetime';
import { addItemToQueue } from '../../actions';
import moment from 'moment';

export class AddMessage extends React.Component {
  static propTypes = {
    addItemToQueue: PropTypes.any,
    selectedQueue: PropTypes.any
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

    close = () => this.setState({
      showModal: false,
      messageType: 'text',
      jsonValue: '',
      textValue: '',
      timeout: '',
      delay: '',
      expires: null,
      expiresISO: '',
      expireError: false
    });

    open = () => this.setState({ showModal: true });

    handleChangeMessageType = (event) => this.setState({ messageType: event.target.value });

    messageChangeHandler = (which) => (newValue) => {
      this.state[which] = newValue.target
        ? newValue.target.value
        : newValue;
      this.setState(this.state);
    }

    delayTmeoutChangeHandler = (which) => (e, newValue) => {
      this.state[which] = e.target.value;
      this.setState(this.state);
    }

    expiresChangeHandler = (momentObj) => {
      this.setState({
        expires: momentObj.format('YYYY-MM-DD HH:mm:ss'),
        expiresISO: momentObj.toISOString()
      });
    }

    addMessage = (e) => {
      let currentTime = moment();
      let expiryTime = moment(this.state.expiresISO);

      let isafter = expiryTime.isAfter(currentTime);

      if (isafter || this.state.expires === null) {
        let message = '';

        if (this.state.messageType === 'text') { message = this.state.textValue; } else { message = this.state.jsonValue; }

        this.props.addItemToQueue(
          this.props.selectedQueue,
          message,
          this.state.timeout,
          this.state.delay,
          this.state.expiresISO
        );

        this.close();
      } else {
        this.setState({ expireError: true });
      }
    }

    render () {
      return (
        <span key={-1}
          className='icon-align cp'
          onClick={this.open}>
          <i className='fa fa-plus icon' />
          <Modal show={this.state.showModal} onHide={this.close}
            dialogClassName='custom-modal modal-reduce-margin-top addMessageModal'>
            <Modal.Header>
              <Modal.Title>
                <span className='modal-title-style'>Add Message</span>
                <i className='fa fa-exchange modal-icon-style pull-right' />
                <div className='modal-title-inner-text'>
                                Insert a new message
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
              <Button bsStyle='primary' onClick={this.addMessage}>Add</Button>
            </Modal.Footer>
          </Modal>
        </span >
      );
    }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    addItemToQueue: (selectedQueue, message, timeout, delay, expires) => dispatch(addItemToQueue(selectedQueue, message, timeout, delay, expires))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddMessage);
