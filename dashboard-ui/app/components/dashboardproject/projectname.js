/**
 * Created by Darkstar on 12/2/2016.
 */
'use strict';

import { saveAppName } from '../../actions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

export class ProjectName extends React.Component {
  static propTypes = {
    name: PropTypes.any,
    value: PropTypes.any,
    planExceeded: PropTypes.any,
    onNameChange: PropTypes.any,
    appId: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      editMode: false,
      value: this.props.name
    };
  }

  componentDidMount () {
    if (this.props.name !== this.state.value) this.setState({ value: this.props.name });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.name !== nextProps.value) this.setState({ value: nextProps.name });
  }

    editName = () => {
      if (!this.props.planExceeded) this.setState({ editMode: true });
    };

    closeEditing = () => {
      this.setState({ editMode: false });
      // return if the name hasnt changed
      if (this.state.value === this.props.name) { return false; }
      this.props.onNameChange(this.props.appId, this.state.value);
    };

    handleChange = (e) => {
      if (!this.props.planExceeded) this.setState({ value: e.target.value });
    };

    handleKeyUp = (e) => {
      if (e.which === 13) {
        this.closeEditing();
      }
    };

    render () {
      if (this.state.editMode === false) {
        return (
          <div className='relative-pos'>
            <h3>
              <input className='nameedit'
                type='text'
                value={this.state.value}
                onChange={() => {}}
                onClick={this.editName}
                style={{ backgroundColor: '#fff !important' }}
              />
            </h3>
          </div>
        );
      } else {
        return (
          <div className='relative-pos'>
            <h3>
              <input ref='input' className='nameeditenable'
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.closeEditing}
                onKeyUp={this.handleKeyUp} />

            </h3>
          </div>
        );
      }
    }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onNameChange: (appId, newName) => {
      dispatch(saveAppName(appId, newName));
    }
  };
};

export default connect(null, mapDispatchToProps)(ProjectName);
