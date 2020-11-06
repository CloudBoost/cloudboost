import {filterColors, chartFillColors} from '../util'
export const tableData = [
    {
        distinctId: 1,
        event: "Visited : Home Page",
        browser: 'Chrome',
        city: "New Delhi",
        country: "India",
        0: "0",
        1: "2",
        2: "4",
        3: "2",
        time: "13 min. ago",
        expand: {
            'Browser': 'Chrome',
            'City': 'New Delhi',
            'Current Url': 'url',
            'OS': 'Windows',
            'Time': '6 minutes ago'
        }

    }, {
        distinctId: 2,
        event: "Visited : Sign Up Page",
        browser: 'Firefox',
        city: "New Delhi",
        country: "India",
        0: "1",
        1: "2",
        2: "4",
        3: "2",
        time: "11 min. ago",
        expand: {
            'Browser': 'Chrome',
            'City': 'New Delhi',
            'Current Url': 'url',
            'OS': 'Windows',
            'Time': '6 minutes ago'
        }
    }, {
        distinctId: 3,
        event: "Visited : Pricing Page",
        browser: 'Safari',
        city: "New Delhi",
        country: "India",
        0: "2",
        1: "2",
        2: "4",
        3: "2",
        time: "13 min. ago",
        expand: {
            'Browser': 'Chrome',
            'City': 'New Delhi',
            'Current Url': 'url',
            'OS': 'Windows',
            'Time': '6 minutes ago'
        }
    }, {
        distinctId: 4,
        event: "Visited : Consulting Page",
        browser: 'Edge',
        city: "New Delhi",
        country: "India",
        0: "3",
        1: "2",
        2: "4",
        3: "2",
        time: "1 day ago",
        expand: {
            'Browser': 'Chrome',
            'City': 'New Delhi',
            'Current Url': 'url',
            'OS': 'Windows',
            'Time': '6 minutes ago'
        }
    }, {
        distinctId: 5,
        event: "Visited : Compare Page",
        browser: 'IE',
        city: "New Delhi",
        country: "India",
        0: "4",
        1: "2",
        2: "4",
        3: "2",
        time: "3 sec. ago",
        expand: {
            'Browser': 'Chrome',
            'City': 'New Delhi',
            'Current Url': 'url',
            'OS': 'Windows',
            'Time': '6 minutes ago'
        }
    }, {
        distinctId: 6,
        event: "Visited : Home Page",
        browser: 'Chrome',
        city: "New Delhi",
        country: "India",
        0: "5",
        1: "2",
        2: "4",
        3: "2",
        time: "5 min. ago",
        expand: {
            'Browser': 'Chrome',
            'City': 'New Delhi',
            'Current Url': 'url',
            'OS': 'Windows',
            'Time': '6 minutes ago'
        }
    }
];

function randomLabels() {
    let labels = [];
    for (let i = 0; i < 22; i++) {
        labels.push("Apr " + Math.ceil(Math.random() * 30));
    }
    return labels;
}

function randomDataset() {
    let datasets = [],
        data = [];
    for (let j = 0; j < 12; j++) {
        for (let i = 0; i < 22; i++) {
            data.push(Math.floor(Math.random() * 10));
        }
        datasets.push({
            label: 'View ' + (j + 1),
            data: data,
            backgroundColor: chartFillColors[j],
            borderColor: filterColors[j],
            fill: false,
            lineTension: '0.1',
            borderWidth: 1
        });
        data = [];
    }
    return datasets;
}
export const chartData = {
    labels: randomLabels(),
    datasets: randomDataset()
};
