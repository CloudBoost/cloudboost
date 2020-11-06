/**
 * Created by Jignesh on 28-06-2017.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { resetAnalytics } from '../../actions';

export class AppAnalytics extends React.Component {
  static propTypes = {
    appData: PropTypes.any,
    resetAnalytics: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = { noData: false };
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

  componentWillMount () {
    // redirect if active app not found
    if (!this.props.appData.viewActive) {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    }// else {
    // this.props.fetchAppAnalytics(this.props.appData.appId);
    // }
  }

  componentDidMount () {
    this.buildMonthyGraph();
    this.buildDailyGraph();
  }

  componentWillUnmount () {
    this.props.resetAnalytics();
  }

  buildMonthyGraph () {
    // eslint-disable-next-line
    let MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    // eslint-disable-next-line
    let config = {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: 'Unique Active registered users',
          fill: false,
          backgroundColor: 'rgb(54, 162, 235)',
          borderColor: 'rgb(54, 162, 235)',
          data: [
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 1000)
          ]
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Monthly Active Users'
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Month'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Active Users'
            }
          }]
        }
      }
    };

    return document.getElementById('graph').getContext('2d');
  }

  buildDailyGraph () {
    // eslint-disable-next-line
    let config = {
      type: 'line',
      data: {
        labels: ['29th May', '30', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '28th July'],
        datasets: [{
          label: 'Unique Active registered users',
          fill: false,
          backgroundColor: 'rgb(54, 162, 235)',
          borderColor: 'rgb(54, 162, 235)',
          data: [
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100),
            (Math.random() > 0.5 ? 1.0 : 0) * Math.round(Math.random() * 100)
          ]
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Daily Active Users'
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Day'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Active Users'
            }
          }]
        }
      }
    };

    return document.getElementById('graph2').getContext('2d');
  }

  render () {
    return (
      <div className='panel-body' style={{
        backgroundColor: '#FFF'
      }}>
        <div className='app-analytics' style={{ textAlign: 'center' }}>
          <h5>45 Active Users at { new Date().toLocaleTimeString() }</h5>
        </div>
        <br />

        <div className='app-analytics' style={{ width: '75%' }}>
          {
            (this.state.noData === false) &&
            <canvas id='graph' />
          }
          {
            (this.state.noData === true) &&
            <div style={{ width: '100%', height: '100%' }} className='flex-general-column-wrapper-center'>
              <div>
                <span style={{ fontSize: 20, color: '#D1D1D1' }}>Monthly Data not available</span>
              </div>
            </div>
          }
        </div>
        <div className='app-analytics' style={{ width: '75%' }}>
          {
            (this.state.noData === false) &&
            <canvas id='graph2' />
          }
          {
            (this.state.noData === true) &&
            <div style={{ width: '100%', height: '100%' }} className='flex-general-column-wrapper-center'>
              <div>
                <span style={{ fontSize: 20, color: '#D1D1D1' }}>Daily Data not available</span>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    appData: state.manageApp
    // analyticsApi: state.analytics.appAnalytics
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // fetchAppAnayltics: (appId) => dispatch(fetchAppAnayltics(appId)),
    resetAnalytics: () => dispatch(resetAnalytics())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppAnalytics);
