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
import { deleteApp } from '../../actions';
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
  constructor (props) {
    super(props);
    this.state = {
      buttonState: false
    };
  }

  static propTypes = {
    deleteButtonState: PropTypes.bool,
    onDelete: PropTypes.func,
    showDeleteModal: PropTypes.func,
    appId: PropTypes.string,
    closeDeleteModal: PropTypes.func,
    handleChange: PropTypes.func,
    loading: PropTypes.bool
  }

  handleKeyChange = (e) => {
    if (e.keyCode === 13 && !this.props.deleteButtonState) { this.props.onDelete(this.props.appId); }
  }

  render () {
    return (

      <Modal className='small-height-modal' show={this.props.showDeleteModal} onHide={this.props.closeDeleteModal}>
        <Modal.Header className='delete-modal-header-style'>
          <Modal.Title>
                        Delete App
            <img className='delete-modal-icon-style pull-right' />
            <div className='modal-title-inner-text'>Please type
              <strong>"DELETE"</strong>&nbsp; in the box below.
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='delete-modal-body'>
          <input onChange={this.props.handleChange('DELETE')} value={this.state.value} id='createApp' placeholder='Please type "DELETE"' onKeyUp={this.handleKeyChange} required />
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn pull-left' onClick={() => this.props.closeDeleteModal()}>
                        Dismiss
          </Button>
          {
            this.props.loading
              ? <Button className='btn btn-danger' disabled>
                <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
              </Button>
              : <Button className='btn btn-danger ' disabled={this.props.deleteButtonState}
                onClick={() => this.props.onDelete(this.props.appId)}>Delete App</Button>
          }
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return { loading: state.loader.modal_loading };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onDelete: (appId) => {
      dispatch(deleteApp(appId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteApp);
