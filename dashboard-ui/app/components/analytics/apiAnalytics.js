/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Chart from 'chart.js';

export class APIAnalytics extends React.Component {
  static propTypes = {
    analyticsApi: PropTypes.shape({
      usage: PropTypes.array
    }),
    appData: PropTypes.shape({
      appId: PropTypes.string
    })
  }

  constructor (props) {
    super(props);
    this.state = {
      totalApiCalls: 0,
      noData: true
    };
  }

  componentDidMount () {
    let APIdata = this.props.analyticsApi.usage
      .filter(temp => (this.props.appData.appId === temp.appId))
      .map(x => [new Date(x.timeStamp).toDateString(), x.dayApiCount]);

    if (APIdata.length > 0) {
      this.setState(
        { noData: false, totalApiCalls: APIdata.reduce((total, element) => total + element[1], 0) },
        () => this.buildGraphs(APIdata)
      );
    }
  }

  componentWillReceiveProps (nextProps) {
    let APIdata = nextProps.analyticsApi.usage
      .filter(temp => (nextProps.appData.appId === temp.appId))
      .map(x => [new Date(x.timeStamp).toDateString(), x.dayApiCount]);

    if (APIdata.length > 0) {
      this.setState(
        { noData: false, totalApiCalls: APIdata.reduce((total, element) => total + element[1], 0) },
        () => this.buildGraphs(APIdata)
      );
    }
  }

  buildGraphs (APIdata) {
    var ctx = document.getElementById('apiChart').getContext('2d');
    let labels = APIdata.map(temp => temp[0]);
    let data = APIdata.map(temp => temp[1]);

    // if there is only one label than it is showing it as single data point instead of line.
    // hence prepending 0 for data and some blank label for label
    // if there is some other solution provided by chart.js, plese do inform jignesh2481991@gmail.com
    if (labels.length === 1 && data.length === 1) {
      labels.unshift(' ');
      data.unshift(0);
    }
    // eslint-disable-next-line
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'API count ',
            data: data,
            backgroundColor: [
              'rgba(255, 255, 255, 0.2)'
            ],
            borderColor: [
              'rgba(33,150,243,1)'
            ],
            borderWidth: 1,
            lineTension: 0,
            fill: false
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: false
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ]
        },
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 50,
            right: 50,
            top: 10,
            bottom: 10
          }
        }
      }
    });
  }

  render () {
    return (
      <div>
        {
          (this.state.noData === false) &&
          <div>
            <div className='flex-general-row-wrapper'
              style={{
                backgroundColor: '#fff',
                paddingLeft: 50,
                paddingRight: 10,
                paddingTop: 30,
                paddingBottom: 10
              }}
            >
              <div className='cf' style={{ height: 60 }}>
                <div className='pull-left'>
                  <div style={{ height: 60, fontSize: 82, marginTop: '-30px' }}>
                                        API
                  </div>
                </div>
              </div>
              <div className='cf' style={{ width: '30%', marginLeft: 30 }}>
                <div className='pull-left'>
                  <div style={{ height: 60, width: 5, backgroundColor: '#549afc' }} />
                </div>
                <div className='pull-left' style={{ marginLeft: 6 }}>
                  <p style={{ color: '#AAAAAA', marginTop: '-3px' }}>CALLS MADE THIS MONTH</p>
                  <p style={{
                    fontSize: 48,
                    fontWeight: 700,
                    marginTop: -20
                  }}>{this.state.totalApiCalls} </p>
                </div>
              </div>
            </div>
            <div>
              <canvas id='apiChart' width='400' height='400' />
            </div>
          </div>
        }
        {
          (this.state.noData === true) &&
          <div style={{ width: '100%', height: '100%' }} className='flex-general-column-wrapper-center'>
            <div>
              <span style={{ fontSize: 20, color: '#D1D1D1' }}>No API usage this month</span>
            </div>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(APIAnalytics);
