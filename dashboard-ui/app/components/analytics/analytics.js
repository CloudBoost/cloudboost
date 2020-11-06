/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchAnalyticsAPI, resetAnalytics, fetchAnalyticsStorage } from '../../actions';
import APIAnalytics from './apiAnalytics';
import StorageAnalytics from './storageAnalytics';

export class Analytics extends React.Component {
  static propTypes = {
    appData: PropTypes.shape({
      viewActive: PropTypes.bool,
      appId: PropTypes.string
    }),
    fetchAnalyticsAPI: PropTypes.func,
    fetchAnalyticsStorage: PropTypes.func,
    resetAnalytics: PropTypes.func,
    analyticsApi: PropTypes.object,
    analyticsStorage: PropTypes.object
  }

  constructor (props) {
    super(props);
    this.state = {};
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

  componentWillMount () {
    // redirect if active app not found
    if (!this.props.appData.viewActive) {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    } else {
      this.props.fetchAnalyticsAPI(this.props.appData.appId);
      this.props.fetchAnalyticsStorage(this.props.appData.appId);
    }
  }

  componentWillUnmount () {
    this.props.resetAnalytics();
  }

  render () {
    return (
      <div className='panel-body' style={{
        backgroundColor: '#FFF'
      }}>
        <div className='cache'>
          <div className='chartcontainer'>
            <APIAnalytics appData={this.props.appData} analyticsApi={this.props.analyticsApi} />
            <StorageAnalytics appData={this.props.appData} analyticsStorage={this.props.analyticsStorage} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    appData: state.manageApp,
    analyticsApi: state.analytics.analyticsApi,
    analyticsStorage: state.analytics.analyticsStorage
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAnalyticsAPI: (appId) => dispatch(fetchAnalyticsAPI(appId)),
    fetchAnalyticsStorage: (appId) => dispatch(fetchAnalyticsStorage(appId)),
    resetAnalytics: () => dispatch(resetAnalytics())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Analytics);
