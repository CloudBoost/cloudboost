import React from 'react';
import {
  Menu,
  MenuItem,
  Popover,
  RaisedButton
} from 'material-ui';

export default class CancelPlanOptions extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false
    };
  }

  handleClick (event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose () {
    this.setState({
      open: false
    });
  };

  render () {
    return (
      <div>
        <RaisedButton
          onClick={this.handleClick}
          label='Change Plan'
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText='Refresh' />
            <MenuItem primaryText='Help &amp; feedback' />
            <MenuItem primaryText='Settings' />
            <MenuItem primaryText='Sign out' />
          </Menu>
        </Popover>
      </div>
    );
  }
}
