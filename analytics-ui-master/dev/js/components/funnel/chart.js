import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Chart from 'chart.js';
import {DateRange, defaultRanges} from 'react-date-range';
import {fetchFunnel} from '../../actions'
import _ from 'underscore'

var myChart;
class FunnelChart extends Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidUpdate() {
        var ctx = $("#funnelChart");
        var thisObj = this;
        if (myChart)
            myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: _.pluck(this.props.funnelData, 'event'),
                datasets: [
                    {
                        label: 'Count',
                        data: _.pluck(this.props.funnelData, 'count'),
                        backgroundColor: 'rgba(84,154,252, 0.2)',
                        borderColor: 'rgba(84,154,252, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                tooltips: {
                    callbacks: {
                        footer: function(tooltipItem, chart) {
                            return 'Conversion: ' + thisObj.conversionRate(tooltipItem[0].index);
                        }
                    },
                    mode: 'nearest'
                },
                scales: {
                    xAxes: [
                        { barPercentage: 0.4 }
                    ],
                    yAxes: [
                        {
                            ticks: { beginAtZero: true }
                        }
                    ]
                },
                legend: { display: false },
                layout: {
                    padding: {
                        left: 20,
                        right: 0,
                        top: 16,
                        bottom: 0
                    }
                }
            }
        });

    }

    conversionRate(index) {
        const {funnelData} = this.props;
        if (index === 0)
            return 'NA'
        else {
            return parseFloat(funnelData[index].count * 100 / funnelData[index - 1].count).toFixed(2);
        }
    }

    render() {

        return (
            <div>
                <canvas id="funnelChart" style={{
                    width: '100%'
                }}></canvas>

            </div>

        );
    }

}
function mapStateToProps(state) {

    const {funnelNames, funnelData} = state.funnels
    return {funnelNames, funnelData};
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchFunnel
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(FunnelChart);
