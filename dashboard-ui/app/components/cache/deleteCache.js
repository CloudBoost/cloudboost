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
    float: 'right',
    marginLeft: '15px'
  }
};

export class Element extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      buttonState: false
    };
  }

  static propTypes = {
    deleteButtonState: PropTypes.bool,
    deleteCache: PropTypes.func,
    selectedCache: PropTypes.object,
    show: PropTypes.bool,
    close: PropTypes.bool,
    loading: PropTypes.bool
  }

  handleKeyChange = (e) => {
    if (e.keyCode === 13 && !this.props.deleteButtonState && e.target.value === 'DELETE') { this.props.deleteCache(this.props.selectedCache); }
  }

  render () {
    return (

      <Modal className='small-height-modal' show={this.props.show} onHide={this.props.close}>
        <Modal.Header className='delete-modal-header-style'>
          <Modal.Title>
                        Delete Cache
            <img className='delete-modal-icon-style pull-right' />
            <div className='modal-title-inner-text'>Please type
              <strong>"DELETE"</strong>&nbsp; in the box below.
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='delete-modal-body'>
          <input className='' value={this.state.value} id='createApp' placeholder='Please type "DELETE"'
            onKeyUp={this.handleKeyChange} required />
        </Modal.Body>
        <Modal.Footer>
          {
            this.props.loading
              ? <Button className='btn-primary create-btn ' disabled>
                <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
              </Button>
              : <Button className='btn btn-danger' disabled={this.props.deleteButtonState}
                onClick={() => this.props.deleteCache(this.props.selectedCache)}>Delete
                                Cache</Button>
          }
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return { loading: state.loader.modal_loading };
};

const mapDispatchToProps = (dispatch) => {
  return { onDelete: appId => dispatch(deleteApp(appId)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Element);
