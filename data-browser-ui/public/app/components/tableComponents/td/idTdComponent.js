import React from 'react';

class IdTdComponent extends React.PureComponent {
  state = {
    expandBtnIsDisplayed: false,
  }

  displayExpandBtn = () => this.setState({ expandBtnIsDisplayed: true });

  hideExpandBtn = () => this.setState({ expandBtnIsDisplayed: false });

	render() {
    const expandBtnClass = `expand-btn ${
      this.state.expandBtnIsDisplayed ? 'visible' : ''
    }`;

		return (
      <td
        className='mdl-data-table__cell--non-numeric pointer'
        onMouseEnter={this.displayExpandBtn}
        onMouseLeave={this.hideExpandBtn}
      >
        <button
          className={expandBtnClass}
          onClick={() => this.props.openRowEntryModal(this.props.elementData)}
        >
          <img src="https://res.cloudinary.com/otse/image/upload/v1552367770/maximize_ogtex2.svg" />
        </button>
        <span>{this.props.elementData}</span>
      </td>
		);
	}
}

export default IdTdComponent;
