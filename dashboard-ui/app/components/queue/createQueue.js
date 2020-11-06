import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { createQueue } from '../../actions';
import { connect } from 'react-redux';
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

export class CreateQueue extends React.Component {
  static propTypes = {
    dispatch: PropTypes.any,
    className: PropTypes.any,
    style: PropTypes.any,
    children: PropTypes.any,
    loading: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      value: ''
    };
  }

    close = () => this.setState({ showModal: false });

    open = () => this.setState({ showModal: true });

    handleChange = (e) => this.setState({ value: e.target.value });

    createQueue = () => {
      this.props.dispatch(createQueue(this.state.value));
      this.setState({ showModal: false, value: '' });
    };
    handleKeyChange = (e) => {
      if (e.keyCode === 13) { this.createQueue(); }
    }

    render () {
      return (
        <div className={this.props.className} style={this.props.style}>
          {React.cloneElement(this.props.children, { onClick: this.open })}
          <Modal className='small-height-modal' show={this.state.showModal} onHide={this.close}>
            <Modal.Header className='modal-header-style'>
              <Modal.Title>
                <span className='modal-title-style'>
                                New Queue
                </span>
                <i className='fa fa-exchange modal-icon-style pull-right' />
                <div className='modal-title-inner-text'>
                                Create a new queue.
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input value={this.state.value} id='createApp' placeholder='Pick a good name' onChange={this.handleChange} onKeyUp={this.handleKeyChange} required />
            </Modal.Body>
            <Modal.Footer>
              {
                this.props.loading
                  ? <Button className='btn-primary create-btn ' disabled>
                    <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
                  </Button>
                  : <Button className='btn-primary create-btn' onClick={this.createQueue}>
                                    Create Queue
                  </Button>
              }
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
}
const mapStateToProps = (state) => {
  return { loading: state.loader.modal_loading };
};

export default connect(mapStateToProps, null)(CreateQueue);
