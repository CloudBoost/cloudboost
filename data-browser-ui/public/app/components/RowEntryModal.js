import React from 'react';
import { observer } from "mobx-react"

import Modal from './Modal';
import GenericTd from './tableComponents/genericTdComponent';
import RowModalSwitcher from './RowModalSwitcher';

@observer
class RowEntryModal extends React.PureComponent {
  state = {
    rowId: this.props.rowId
  };

  componentDidUpdate (prevProps) {
    if (this.props.rowId !== prevProps.rowId) {
      this.setState({ rowId: this.props.rowId });
    }
  }

  switchRow = (type) => () => {
    const rowData = type === 'next'
      ? this.props.tableStore.getNextRow(this.state.rowId)
      : this.props.tableStore.getPrevRow(this.state.rowId);

    if (rowData) {
      this.setState({
        rowData,
        rowId: rowData.document._id
      })
    }
  }

  icons = {
    'Text': 'fa-font',
    'Number': 'fa-hashtag',
    'URL': 'fa-external-link',
    'Boolean': '',
    'Email': 'fa-at',
    'Id': '',
    'EncryptedText': '',
    'DateTime': 'fa-calendar',
    'Object': '',
    'GeoPoint': 'fa-map-marker',
    'File': 'fa-file-image-o',
    'List': '',
    'Relation': '',
    'ACL': 'fa-user'
  }


  render () {
    const { opened, handleClose, tableStore } = this.props;
    const rowData = this.state.rowData || tableStore.getRowData(this.props.rowId);
    const columns = tableStore.getColumns;

    return (
      <Modal
        opened={opened}
        handleClose={handleClose}
        classes="row-modal"
      >

        <div className="row-modal-body">
          <div className="row-modal-switcher">
            <RowModalSwitcher
              size={10}
              switchToNextRow={this.switchRow('next')}
              switchToPrevRow={this.switchRow('prev')}
              nextExists={Boolean(tableStore.getNextRow(this.state.rowId))}
              prevExists={Boolean(tableStore.getPrevRow(this.state.rowId))}
            />
            {
              rowData.document &&
              <h4 className="row-modal-name">
                {rowData.document.name}
              </h4>
            }
          </div>
          {
            columns
              .filter(column => column.name !== 'id')
              .map((column, index) => (
                <div
                  className="row-modal-entry"
                  key={column.name}
                  tabIndex={0}
                >

                  <label
                    htmlFor={column.name}
                  >
                    <i
                      className={`fa ${this.icons[column.dataType]}`}
                      aria-hidden="true"
                    >
                    </i>
                    {column.name}
                  </label>
                  <GenericTd
                    key={index}
                    columnType={column}
                    columnData={rowData}
                    tableStore={tableStore}
                  />
                </div>
              ))
          }
        </div>
      </Modal>
    )
  }
}

export default RowEntryModal;
