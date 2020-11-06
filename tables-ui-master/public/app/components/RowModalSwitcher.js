import React from 'react';
import ArrowIcon from './ArrowIcon';

const RowModalSwitcher = (props) => (
  <span>
    <button
      className="row-modal-switcher-btn"
      onClick={props.switchToNextRow}
      disabled={props.nextExists ? '' : 'disabled'}
    >
      <ArrowIcon
        direction="down"
        size={props.size}
      />
    </button>
    <button
      className="row-modal-switcher-btn"
      onClick={props.switchToPrevRow}
      disabled={props.prevExists ? '' : 'disabled'}
    >
      <ArrowIcon
        direction="up"
        size={props.size}
      />
    </button>
  </span>
);

export default RowModalSwitcher;
