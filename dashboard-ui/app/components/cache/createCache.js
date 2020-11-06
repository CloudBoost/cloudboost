import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { createCache } from '../../actions';
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
export class CreateCache extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      value: ''
    };
  }

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.element,
    dispatch: PropTypes.func,
    loading: PropTypes.bool
  }

    close = () => this.setState({ showModal: false });

    open = () => this.setState({ showModal: true });

    handleChange = (e) => this.setState({ value: e.target.value });

    createCache = () => {
      this.props.dispatch(createCache(this.state.value));
      this.setState({ showModal: false, value: '' });
    };

    handleKeyChange = (e) => {
      if (e.keyCode === 13) { this.createCache(); }
    }

    render () {
      return (
        <div className={this.props.className}>
          {React.cloneElement(this.props.children, { onClick: this.open })}
          <Modal className='small-height-modal' show={this.state.showModal} onHide={this.close}>
            <Modal.Header className='modal-header-style'>
              <Modal.Title>
                <span className='modal-title-style'>
                                New Cache
                </span>
                <i className='fa fa-bolt modal-icon-style pull-right' style={{ paddingLeft: 16 }} />
                <div className='modal-title-inner-text'>
                                Create a new cache.
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input value={this.state.value} id='createApp' placeholder='Pick a good name'
                onChange={this.handleChange} onKeyUp={this.handleKeyChange} required />
            </Modal.Body>
            <Modal.Footer>
              {
                this.props.loading
                  ? <Button className='btn-primary create-btn 'disabled>
                    <Loader size={10} distance={5} color='#ececec' style={style.refresh} />
                  </Button>
                  : <Button className='btn-primary create-btn' onClick={this.createCache}>
                                    Create Cache
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

export default connect(mapStateToProps, null)(CreateCache);
