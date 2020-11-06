import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'underscore'
import {filterColors, chartFillColors} from '../../util'

let myChart;

class Segementation extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    randomLabels() {

        let month = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        let labels = _.allKeys(this.props.periodEvents);

        labels = _.map(labels, (label) => {
            const date = new Date(parseInt(label));
            return month[date.getMonth()] + ' ' + date.getDate();
        });

        return labels;
    }

    componentWillMount() {
        this.state.chartFilters = this.props.chartFilters;
        this.setState(this.state);
    }

    randomDataset() {

        let datasets = [], data = [];
        // let daysEvents = this.props.day;
        let {periodEvents} = this.props;

        if (periodEvents) {
            //prepare events for chart data
            let labels = _.allKeys(periodEvents);

            _.each(this.props.allEventsName, (eventName, j) => {

                if (this.props.chartFilters[eventName]) {

                    _.each(labels, (label, i) => {

                        if (periodEvents[label][eventName])
                            data.push(periodEvents[label][eventName].length);
                        else
                            data.push(0);
                    });

                    datasets.push({
                        label: eventName,
                        data: data,
                        backgroundColor: chartFillColors[j],
                        borderColor: filterColors[j],
                        fill: false,
                        lineTension: '0',
                        borderWidth: 1
                    });

                    data = []
                }
            })
        }

        return datasets;
    }

    componentDidUpdate() {
        const chartData = {
            labels: this.randomLabels(),
            datasets: this.randomDataset()
        };
        let ctx = $("#segmentationChart");
        if (myChart)
            myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: { beginAtZero: true }
                        }
                    ],
                    xAxes: [
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
                        top: 0,
                        bottom: 0
                    }
                }
            }
        });
    }

    componenentWillReceiveProps(nextProps) {
        this.state.chartFilters = nextProps.chartFilters;
        this.setState(this.state);
    }

    render() {
        return (
            <canvas id="segmentationChart"
                    width="360px"
                    height="360px"
                    style={{border: "1px solid #e7e7e7", borderTop: 0}}/>
        );
    }

}

function mapStateToProps(state) {

    const {eventsName,chartFilters} = state.allEvents;
    
    return {
        allEventsName: eventsName,
        chartFilters : chartFilters
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Segementation);
