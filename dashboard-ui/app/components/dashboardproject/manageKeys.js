'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import OptionsModal from './optionsModal';
import { Modal } from 'react-bootstrap';

export class DeleteApp extends React.Component {
  static propTypes = {
    deleteButtonState: PropTypes.any,
    appId: PropTypes.any,
    onDelete: PropTypes.any,
    show: PropTypes.any,
    close: PropTypes.any,
    id: PropTypes.any,
    loading: PropTypes.any,
    masterKey: PropTypes.any,
    clientKey: PropTypes.any,
    planId: PropTypes.any,
    developers: PropTypes.any,
    selectedTab: PropTypes.any,
    invited: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      buttonState: false
    };
  }

  handleKeyChange (e) {
    if (e.keyCode === 13 && !this.props.deleteButtonState) { this.props.onDelete(this.props.appId); }
  }

  render () {
    return (

      <Modal show={this.props.show} dialogClassName='developers-modal' onHide={this.props.close}>
        <Modal.Header style={{
          paddingTop: 10
        }} className='modal-header-style'>
          <Modal.Title>

            <span className='modal-title-style'>
                            App Keys
            </span>
            <img className='modal-icon key-modal-icon-style pull-right' />

            <div className='modal-title-inner-text'>Use these keys to initialize your app.

            </div>

          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OptionsModal loading={this.props.loading} id={this.props.id} appId={this.props.appId} masterKey={this.props.masterKey} clientKey={this.props.clientKey} planId={this.props.planId} developers={this.props.developers} invited={this.props.invited} selectedTab={this.props.selectedTab} />
        </Modal.Body>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};
const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteApp);
