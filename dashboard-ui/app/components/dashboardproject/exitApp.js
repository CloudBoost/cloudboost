/**
 * Created by Darkstar on 12/21/2016.
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
export class DeleteApp extends React.Component {
  static propTypes = {
    deleteButtonState: PropTypes.any,
    show: PropTypes.any,
    onDeleteDev: PropTypes.any,
    appId: PropTypes.any,
    handleChange: PropTypes.any,
    close: PropTypes.any,
    loading: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      buttonState: false
    };
  }
  handleKeyChange = (e) => {
    if (e.keyCode === 13 && !this.props.deleteButtonState) { this.props.onDeleteDev(this.props.appId); }
  }

  handleChange = () => this.props.handleChange('REMOVE');

  render () {
    return (

      <Modal className='small-height-modal' show={this.props.show} onHide={this.props.close}>
        <Modal.Header className='delete-modal-header-style'>
          <Modal.Title>
                        Exit App
            <img className='exit-app-modal-icon-style pull-right' />
            <div className='modal-title-inner-text'>Please type
              <strong>"REMOVE"</strong>&nbsp; in the box below.
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='delete-modal-body'>
          <input onChange={this.handleChange} className='' value={this.state.value} id='createApp' placeholder='Please type "REMOVE"' onKeyUp={this.handleKeyChange} required />
        </Modal.Body>
        <Modal.Footer>
          {
            this.props.loading
              ? <Button className='btn btn-danger' disabled>
                <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
              </Button>
              : <Button className='btn btn-danger' disabled={this.props.deleteButtonState}
                onClick={() => this.props.onDeleteDev(this.props.appId)}>Exit</Button>
          }
        </Modal.Footer>
      </Modal>
    );
  }
}
const mapStateToProps = (state) => {
  return { loading: state.loader.modal_loading };
};

export default connect(mapStateToProps, null)(DeleteApp);
