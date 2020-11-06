import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import TransparentLoader from 'react-loader-advanced';
import { Table, Button } from 'react-bootstrap';

import { fetchInvoices, exportInvoice } from '../../actions';
import { toUSD } from './helpers';

const styles = {
  vcenter: {
    'vertical-align': 'middle'
  }
};

class InvoicePage extends Component {
  static propTypes = {
    onLoad: PropTypes.any,
    invoices: PropTypes.any,
    activeAppId: PropTypes.any,
    masterKey: PropTypes.any,
    loading: PropTypes.any,
    downloadPdf: PropTypes.any
  }
  componentWillMount () {
    const { onLoad, invoices, activeAppId, masterKey } = this.props;

    if (invoices.length === 0) {
      onLoad(activeAppId, masterKey);
    }
  }

  render () {
    const { invoices, loading, downloadPdf } = this.props;
    return (
      <div style={{ paddingBottom: 0, paddingTop: 41, paddingLeft: 54 }}>
        <h2 className='head'>Invoices</h2>
        <TransparentLoader show={loading}
          message={<RefreshIndicator
            size={40}
            left={0}
            top={0}
            status='loading'
            style={{ marginLeft: '50%', position: 'relative' }}
          />}
          contentBlur={1}
          backgroundStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
          <Table responsive striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Number</th>
                <th>Amount</th>
                <th>Issue Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {
                invoices.map((datum, index) => (
                  <tr key={datum.id}>
                    <td style={styles.vcenter}> {index + 1} </td>
                    <td style={styles.vcenter}>{datum.number}</td>
                    <td style={styles.vcenter}>{toUSD(datum.amount_paid, 100)}</td>
                    <td style={styles.vcenter}>{moment.unix(datum.date).format('MMM DD, YYYY')}</td>
                    <td>
                      <Button
                        bsSize='small'
                        onClick={() => downloadPdf(datum.id, datum.number)}> Download </Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </TransparentLoader>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let invoices = state.apps.find(app => (app.appId === state.manageApp.appId)).invoices;
  return {
    activeAppId: state.manageApp.appId,
    loading: state.loader.secondary_loading,
    masterKey: state.manageApp.masterKey,
    beacons: state.beacons,
    invoices: invoices || []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: (appId, masterKey) => dispatch(fetchInvoices(appId, masterKey)),
    downloadPdf: (invoiceId, invoiceNum) => dispatch(exportInvoice(invoiceId, invoiceNum))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(InvoicePage);
