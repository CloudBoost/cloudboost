import React from 'react';
import ReactDOM from 'react-dom';
import configObject from '../../config/app.js'
import Checkbox from '../checkbox';
import { observer } from "mobx-react"

@observer
class RowCheckBoxComponent extends React.Component {
	state = {
    rowNumberIsDisplayed: true,
	}

  hideRowNumber = () => this.setState({ rowNumberIsDisplayed: false });

  showRowNumber = () => this.setState({ rowNumberIsDisplayed: true });

  handleCheck = () => {
    this.props.checkHandler(
      this.props.indexValue,
      this.props.rowObject.id,
      null,
      !this.isRowSelected()
    );

    this.setState({ rowNumberIsDisplayed: this.isRowSelected() });
  }

  isRowSelected = () => this.props.tableStore
    .rowsToDelete
    .indexOf(this.props.rowObject.id) !== -1;

	render() {
    const rowSelected = this.isRowSelected();

		return (
      <td
        onMouseEnter={rowSelected ? null : this.hideRowNumber}
        onMouseLeave={rowSelected ? null : this.showRowNumber}
        className="checkbox-cell"
      >
        {
          (this.state.rowNumberIsDisplayed && rowSelected === false) &&
          <span>
            { this.props.indexValue + 1 }
          </span>
        }

        {
          (this.state.rowNumberIsDisplayed === false || rowSelected) &&
          <Checkbox
            onCheck={this.handleCheck}
            checked={rowSelected}
          />
        }
      </td>
		);
	}
}

export default RowCheckBoxComponent;
