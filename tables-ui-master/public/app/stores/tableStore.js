import { observable, computed } from 'mobx'
import { browserHistory } from 'react-router';
import axios from 'axios'

class TableStore {
	@observable TABLE = {}
	@observable tables = []
	@observable apps = []
	@observable columns = []
	@observable columnsData = []
	@observable hiddenColumns = []
	@observable rowsToDelete = []
	@observable recordsToShow = 20
	@observable appId = null

	@computed get getColumns() {
		if (this.columns.document) {
			return this.columns.document.columns.map(x => x.document)
		} else {
			return []
		}
	}
	@computed get getColumnsData() {
		return this.columnsData.map(x => x.document)
	}
	@computed get getTables() {
		return this.tables.map(x => x.document)
	}

	initialize(appId, tableName, allApps) {
		CB.CloudTable.getAll().then((response) => {
			const data = response.filter(obj => obj !== null);
			if (data[0]) {
				this.TABLE = data[0].document.name
			}
			if (tableName) {
				let tableFound = data.filter(x => x.document.name == tableName)[0]
				if (tableFound) this.TABLE = tableFound.document.name
			}

			// enable realtime updates for table
			this.realTimeUpdateTable(this.TABLE)

			this.apps = allApps
			this.appId = appId
			this.tables = data
			this.recordsToShow = 20
			this.setColumns()
			this.setColumnsData()
		})
		.catch(err => {
			this.showSnackbar("Error fetching table, please try again.")
				console.log(err);
		});
	}
	// set CRUD listeners for relatime table updates
	realTimeUpdateTable(tables) {
		CB.CloudObject.on(this.TABLE, ['created', 'updated', 'deleted'], function (obj) {
			console.log('table updated')
			this.setColumnsData()
		}.bind(this));
	}
	changeTable(tableName){
		browserHistory.push(TABLES_BASE_URL + this.appId + "/" + tableName)
		this.TABLE = tableName
		this.recordsToShow = 20
		this.setColumns()
		this.setColumnsData()
		// enable realtime updates for table
		this.realTimeUpdateTable(this.TABLE)
	}
	createTable(tableName) {
		let table = new CB.CloudTable(tableName)
		table.save().then((res) => {
			this.initialize(this.appId, tableName, this.apps)
		}, (err) => {
			this.showSnackbar("Error creating a table, please try again.")
			console.log(err)
		})
	}
	deleteTable(tableName) {
		let table = this.tables.filter(x => x.document.name == tableName)[0]
		table.delete().then((res) => {
			this.initialize(this.appId, null, this.apps)
		}, (err) => {
			this.showSnackbar("Error deleting this table, please try again.")
			console.log(err)
		})
	}
	addColumn(column) {
		let table = this.tables.filter(x => x.document.name == this.TABLE)[0]
		table.addColumn(column);
		table.save().then((res) => {
			this.setColumns()
			this.setColumnsData()
			// scroll to the extreme left of the table
			setTimeout(() => {
				$('#datatable').scrollLeft($('#datatable').outerWidth())
			}, 500)
		}, (err) => {
			this.showSnackbar("Cannot add a column, please try again.")
			console.log(err)
		})
	}
	deleteColumn(column) {
		let table = this.tables.filter(x => x.document.name == this.TABLE)[0]
		table.deleteColumn(column);
		table.save().then((res) => {
			this.setColumns()
			this.setColumnsData()
		}, (err) => {
			this.showSnackbar("Cannot delete this column, please try again.")
			console.log(err)
		})
	}
	editColumn(columnName, uniqueValue, requiredValue, newName) {
		let table = this.tables.filter(x => x.document.name == this.TABLE)[0]
		let column = table.getColumn(columnName)
		column['required'] = requiredValue
		column['unique'] = uniqueValue
		if (newName)
			column.name = newName;
		table.updateColumn(column);
		table.save().then((res) => {
			this.setColumns()
			this.setColumnsData()
		}, (err) => {
			this.showSnackbar("Error editiing this column, please try again.")
			console.log(err)
		})
	}
	setColumns() {
		CB.CloudTable.get(this.TABLE).then((data) => {
			this.columns = data
		})
	}
	setColumnsData() {
		let query = new CB.CloudQuery(this.TABLE)
		query.setLimit(this.recordsToShow)
		query.find().then((list) => {
			this.columnsData = list
		})
	}
	showNextRecords(limit) {
		this.recordsToShow += limit
		let query = new CB.CloudQuery(this.TABLE)
		query.setLimit(this.recordsToShow)
		query.find().then((list) => {
			if (this.columnsData.length != list.length) this.columnsData = list
		})
	}
	sortColumnsData(what, columnName) {
		let query = new CB.CloudQuery(this.TABLE)
		query.setLimit(20);
		query[what](columnName);
		query.find().then((list) => {
			this.columnsData = list
		})
	}

	search(searchString) {
		let query = new CB.CloudQuery(this.TABLE)
		query.setLimit(this.recordsToShow)
		if (searchString) query.search(searchString)
		return query.find()
	}

	updateColumnsData(data) {
		this.columnsData = data
	}

	addRow(data) {
		data.save().then((res) => {
			// for quick update in UI, real table update is handled by realTime updater now
			this.columnsData.push(data)
		}, (err) => {
			data.error = err
			// push this to resolve the error in UI
			this.columnsData.push(data)
		})
	}

	hideColumn(name) {
		this.hiddenColumns = this.hiddenColumns.concat([name])
	}

	removeHiddenColumn(name) {
		this.hiddenColumns = this.hiddenColumns.filter(x => x != name)
	}

	showAll() {
		this.hiddenColumns = this.hiddenColumns.filter(x => false)
	}

	addToDeleteRows(objectId) {
		this.rowsToDelete.push(objectId)
	}
	removeFromDeleteRows(objectId) {
		this.rowsToDelete.splice(this.rowsToDelete.indexOf(objectId), 1)
	}
	deleteRows() {
		let prm = []
		this.columnsData = this.columnsData.filter((row) => {
			if (this.rowsToDelete.indexOf(row.id) > -1) {
				prm.push(row.delete())
				return false
			}
			return true
		})
		Promise.all(prm).then((res) => {
			$('[data-row]').removeClass('lgrey')
			// table update is handled by realTime updater now
			// this.setColumnsData()
			this.rowsToDelete = []
		})
	}
	updateTableProperty(which, value) {
		let currentTable = this.tables.filter(x => x.document.name == this.TABLE)[0]
		currentTable.document[which] = value
		currentTable.save().then((res) => {
			this.setColumns()
		}, (err) => {
			this.setColumns()
		})
	}
	exportTable(type){
		let exportTableUrl = SERVER_URL + '/export/' + this.appId + '/' + this.TABLE;
		let postObject = {
			key: CB.appKey,
			exportType: type
		};
		var $this = this;
		return axios({
			method: 'post',
			url: exportTableUrl,
			data: postObject,
			withCredentials: false,
			responseType: 'blob'
		}).then(function(response){
			return {
				tableName: $this.TABLE,
				data: response.data
			}
		});
	}
	uploadDocumentRequest(path, file, data, type) {
		let cloudFile = new CB.CloudFile(file, data, type, path);
		let tableName = this.TABLE.split('.')[0];
		var $this = this;
		return cloudFile.save({
			success: function (cloudFile) {
				$this.showSnackbar("File uploaded for processing", "success");
				var importTableURL = SERVER_URL + "/import/" + $this.appId;
				var body = {
					key: CB.appKey,
					fileId: cloudFile.document._id,
					fileName: cloudFile.document.name,
					tableName: tableName
				};
				axios({
					method: 'post',
					url: importTableURL,
					data: body,
					withCredentials: false
				}).then(function (response) {
						$this.initialize($this.appId, tableName, $this.apps)
						cloudFile.delete({
							success: function(fileObj) {
								$this.showSnackbar("File imported successfully!!", "success");
							},
							error: function(err) {
								$this.showSnackbar("Error in deleting file");
							}
						});
					})
					.catch(function (error) {
						$this.showSnackbar(error.message + " : Error in processing document")
					});
			},
			error: function (error) {
				console.log(error)
				$this.showSnackbar("Error in saving document")
			}
		});
	}
	showLoader() {
		$('#table').addClass('hide')
		$('#tableoverlap').addClass('hide')
		$('#loader').removeClass('hide')
	}
	hideLoader() {
		$('#table').removeClass('hide')
		$('#tableoverlap').removeClass('hide')
		$('#loader').addClass('hide')
	}
	showTopLoader() {
		$('.searchheading').hide(500)
		$('#loaderTop').show(500)
	}
	hideTopLoader() {
		$('#loaderTop').hide(500)
		$('.searchheading').show(500)
	}
	showSnackbar(text, type) {
		Messenger().post({
			message: text,
			type: type || 'error',
			showCloseButton: true
		});
	}

  getRowData(rowId) {
    const rowData = this.columnsData
      .filter(data => data.document._id === rowId);

    if (rowData.length > 0) {
      return rowData[0];
    }

    return false;
  }

  getNextRow(rowId) {
    const currentRowIndex = this.columnsData
      .findIndex(data => data.document._id === rowId);

    if (currentRowIndex > -1) {
      const nextRowIndex = currentRowIndex + 1
      const nextRow = this.columnsData[nextRowIndex]

      return nextRow || null;
    }

    return null;
  }

  getPrevRow(rowId) {
    const currentRowIndex = this.columnsData
      .findIndex(data => data.document._id === rowId);

    if (currentRowIndex > -1) {
      const prevRowIndex = currentRowIndex - 1
      const prevRow = this.columnsData[prevRowIndex]

      return prevRow || null;
    }

    return null;
  }
}

export default new TableStore()
