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
import { Button, Modal } from 'react-bootstrap';
import Loader from 'react-dots-loader';
import 'react-dots-loader/index.css';

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

export class CancelPlan extends React.Component {
  static propTypes = {
    onCancel: PropTypes.any,
    appId: PropTypes.any,
    closeCancelModal: PropTypes.any,
    showCancelModal: PropTypes.any,
    loading: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      matchValue: false
    };
  }

  submitForm = () => {
    this.props.onCancel(this.props.appId)
      .then(() => {
        this.props.closeCancelModal(true);
      });
  }

  handleKeyChange = (e) => {
    if (e.keyCode === 13 && this.state.matchValue) { this.submitForm(e); }
  }

  handleChange = (value) => (e) => {
    if (e.target.value === value) {
      this.state.matchValue = true;
      this.setState(this.state);
    }
  }

  render () {
    return (

      <Modal className='small-height-modal' show={this.props.showCancelModal} onHide={this.props.closeCancelModal}>
        <Modal.Header className='delete-modal-header-style'>
          <Modal.Title>
                        Cancel Plan
            <img className='delete-modal-icon-style pull-right' />
            <div className='modal-title-inner-text'>Please type
              <strong>"CANCEL"</strong>&nbsp; in the box below.
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='delete-modal-body'>
          <input onChange={this.handleChange('CANCEL')} value={this.state.value} id='createApp' placeholder='Please type "CANCEL"' onKeyUp={this.handleKeyChange} required />
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn pull-left' onClick={() => this.props.closeCancelModal()}>
                        Dismiss
          </Button>
          {
            this.props.loading
              ? <Button className='btn btn-danger' disabled>
                <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
              </Button>
              : <Button className='btn btn-danger' disabled={!this.state.matchValue}
                onClick={this.submitForm}>Cancel Plan</Button>
          }
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return { loading: state.loader.modal_loading };
};

export default connect(mapStateToProps, null)(CancelPlan);
