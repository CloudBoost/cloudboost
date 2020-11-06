import React from 'react';

class Modal extends React.Component {
  componentDidUpdate () {
    if (this.props.opened) {
      this.refs.modalDiv.focus();
    }
  }

  handleContentAreaClick = (event) => {
    event.stopPropagation();
  }

  handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.props.handleClose();
    }
  }

  render () {
    return (
      this.props.opened &&
      <div
        className="modal"
        onClick={this.props.handleClose}
        onKeyDown={this.handleKeyDown}
        tabIndex="0"
        ref="modalDiv"
      >
        <div
          className={`modal-content ${this.props.classes}`}
          onClick={this.handleContentAreaClick}
        >
          <button
            className="modal-close-btn"
            onClick={this.props.handleClose}
          >
            <img
              src="https://res.cloudinary.com/otse/image/upload/v1553691538/cancel-icon_ainh1w.svg"
            />
          </button>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Modal;
