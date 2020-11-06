import React from 'react';

class Checkbox extends React.Component {
  state = {
    checked: false
  }

  static defaultProps = {
    checked: false
  }

  toggleCheck = (event) => {
    event.persist();

    this.setState(
      { checked: !this.state.checked },
      () => this.props.onCheck(event, this.state.checked)
    );
  }

  render () {
    const checked = this.props.checked || this.state.checked;
    const checkboxClassName = `
      checkbox
      ${ checked ? 'checked' : '' }
      ${ this.props.className || '' }
    `;

    return (
      <div
        { ...this.props }
        onClick={this.toggleCheck}
        className={checkboxClassName}
      >
        { checked && <span>✔</span> }
      </div>
    );
  }
}

export default Checkbox;
