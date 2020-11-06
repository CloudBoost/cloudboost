'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

// const style = {
//   refresh: {
//     display: 'inline-block',
//     position: 'relative',
//     background: 'none',
//     boxShadow: 'none',
//     marginLeft: '18px',
//     marginRight: '18px'
//   }
// };

export class Element extends React.Component {
  static propTypes = {
    deleteButtonState: PropTypes.any,
    deleteQueue: PropTypes.any,
    show: PropTypes.any,
    selectedQueue: PropTypes.any,
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
    if (e.keyCode === 13 && !this.props.deleteButtonState && e.target.value === 'DELETE') { this.props.deleteQueue(this.props.selectedQueue); }
  }

  render () {
    return (

      <Modal className='small-height-modal' show={this.props.show} onHide={this.props.close}>
        <Modal.Header className='delete-modal-header-style'>
          <Modal.Title>
                        Delete Queue
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
                {/* <Loader size={10} distance={5} color='#ececec' style={style.refresh} /> */}
              </Button>
              : <Button className='btn btn-danger' disabled={this.props.deleteButtonState}
                onClick={() => this.props.deleteQueue(this.props.selectedQueue)}>Delete
                                Queue
              </Button>
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
      // dispatch(deleteApp(appId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Element);
