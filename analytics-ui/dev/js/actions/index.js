import async from 'async';
import _ from 'underscore';
import lodash from 'lodash'
import groupByTime from 'group-by-time';
import {xhrDashBoardClient, AccountsURL} from '../xhrClient'
const queryLabels = ['equalTo', 'notEqualTo', 'greaterThan', 'startsWith'];
import {browserHistory} from "react-router";

export const initApp = (appId) => {
    return ((dispatch) => {

        xhrDashBoardClient.get('user').then((userData) => {
            dispatch({type: 'FETCH_USER', payload: userData.data})

            xhrDashBoardClient.get('app').then((data) => {

                let allApps = [];
                let availableApps = data.data.filter((obj) => !obj.deleted);
                let length = availableApps.length;
                if (availableApps.length == 0)
                    window.location.href = DASHBOARD_URL;

                availableApps.forEach((app) => {
                    allApps.push({name: app.name, appId: app.appId});
                    length--;
                    if (length == 0) {
                        if (!appId || appId == '' || appId == "" || appId === undefined)
                            window.location.href = ANALYTICS_URL + availableApps[0].appId + '/segmentation';
                        else {
                            app = availableApps.filter(function(obj) {
                                return obj.appId == appId;
                            });
                        }
                        if (app.length === 0)
                            window.location.href = ANALYTICS_URL + availableApps[0].appId + '/segmentation';

                        if (__isHosted == "true" || __isHosted == true) {
                            CB.CloudApp.init(SERVER_URL, appId, app[0].keys.master)
                        } else
                            CB.CloudApp.init(SERVER_URL, appId, app[0].keys.master)

                        CB.CloudObject.on('_Event', 'created', function(data) {
                            data.document.newEvent = true;
                            dispatch({type: 'NEW_EVENT', payload: data.document})
                        });

                        let userProfilePic = null;
                        if (userData.data.file)
                            userProfilePic = userData.data.file.document.url;
                        dispatch({
                            type: 'APP_INIT_SUCCESS',
                            payload: {
                                appId: app[0].appId,
                                appName: app[0].name,
                                allApps: allApps,
                                userProfilePic: userProfilePic
                            }
                        });
                        dispatch(fetchAllEvents());
                        dispatch(fetchEventsPageWise({currentPage: 1}))
                        dispatch(getBeacon());
                        dispatch(getNotifications());
                        dispatch(fetchAllFunnels())
                    }
                });
            }, (err) => {
                console.log(err);
            });

        }, (err) => {
            window.location.href = ACCOUNTS_URL + '?redirectUrl=' + ANALYTICS_URL
        })

    })
}

export const fetchAllEvents = () => {
    return ((dispatch) => {
        let query = new CB.CloudQuery("_Event");
        query.setLimit(99999)
        query.find({
            success: function(data) {
                let events = _.pluck(data, 'document');
                dispatch({type: "STOP_LOADING"});
                dispatch({type: "FETCH_ALL_EVENTS", payload: {
                        events
                    }});
                dispatch({type: 'FILTERED_EVENTS', payload: {
                        events
                    }})
                dispatch(groupAllEvents(data));
            },
            error: function(err) {
                console.log(err);
                dispatch({type: "STOP_LOADING"});
            }
        })
    })

}

export const changeChartFilters = (data) => {
    return ((dispatch) => {
        dispatch({ type: "CHANGE_CHART_FILTER", payload: data });
    })

}

export const filterEvents = (data) => {
    return ((dispatch) => {
        let {obj, eventName, isOrQuery, startDate, endDate} = data;
        let query = new CB.CloudQuery("_Event");
        query.setLimit(99999)
        if (obj)
            query = _addFilterQuery(query, eventName, obj, true, isOrQuery);
        query.lessThanEqualTo('createdAt', endDate)
        query.greaterThanEqualTo('createdAt', startDate)
        query.find({
            success: function(data) {
                let events = _.pluck(data, 'document');
                dispatch({type: "STOP_LOADING"});
                dispatch({type: 'FILTERED_EVENTS', payload: {
                        events
                    }})
                dispatch(groupAllEvents(data));
            },
            error: function(err) {
                console.log(err);
                dispatch({type: "STOP_LOADING"});
            }
        })
    })
}

export const fetchEventsPageWise = (data) => {
    // here limit and skip are used
    /*
    this function is used to fetch events page wise
    PS: to fech all the events call fetchAllEvents()
    */
    return ((dispatch) => {
        /*
        filterEvents is used to check whether any filter is to be applied or not
      addEventFilter is used to check whether filter on event name is to be applied to not.
      */
        dispatch({type: "START_LOADING"});
        let {currentPage, filterEvents, event, obj, addEventFilter} = data
        if (!currentPage)
            currentPage = 1
        let query = new CB.CloudQuery("_Event");
        if (filterEvents)
            query = _addFilterQuery(query, event, obj, addEventFilter);
        query.paginate(currentPage, 20, {
            success: function(data, count, totalPages) {
                let events = _.pluck(data, 'document');
                dispatch({type: "STOP_LOADING"});
                if (currentPage === 1)
                    dispatch({
                        type: "FETCH_EVENTS_PAGE",
                        payload: {
                            events,
                            currentPage,
                            totalPages
                        }
                    });
                else
                    dispatch({
                        type: "FETCH_EVENTS_PAGE_ADD",
                        payload: {
                            events,
                            currentPage,
                            totalPages
                        }
                    });
                if (filterEvents)
                    dispatch({
                        type: 'FILTER_EVENTS',
                        payload: {
                            filterEvents,
                            event,
                            obj,
                            addEventFilter
                        }
                    })
            },
            error: function(err) {
                console.log(err);
                dispatch({type: "STOP_LOADING"});
            }
        });
    });
}

export function createFunnel(name, data, appId) {
    return function (dispatch) {
        let obj = new CB.CloudObject('_Funnel');
        obj.set('name', name);
        obj.set('data', data);
        obj.save()
            .then((obj) => {
                //dispatch({type: 'CREATE_FUNNEL'});
                return browserHistory.push(ANALYTICS_BASE_URL + appId + '/funnel');
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

export function deleteFunnel(funnelObj, appId) {
    return function (dispatch) {

        let obj = CB.fromJSON(funnelObj);
        obj.fetch({
            success: (obj) => {
                obj.delete({
                    success: (obj) => {
                        return dispatch(fetchAllFunnels());

                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            },
            error: (err) => {
                console.log(err)
            }
        })
    }
}

export function editFunnel(funnelObj, name, data, appId) {
    return function (dispatch) {

        let obj = CB.fromJSON(funnelObj);
        obj.fetch({
            success: (obj) => {
                obj.set('name', name);
                obj.set('data', data);
                obj.save({
                    success: (obj) => {
                        //dispatch({type: 'EDIT_FUNNEL'})
                        return browserHistory.push(ANALYTICS_BASE_URL + appId + '/funnel');
                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            },
            error: (err) => {
                console.log(err)
            }
        })
    }
}

export function fetchAllFunnels() {
    return function(dispatch) {
        let query = new CB.CloudQuery('_Funnel')
        query.setLimit(999999)
        query.find().then((data) => {
            let documentArr = _.pluck(data, 'document')
            dispatch({type: 'FETCH_FUNNELS', payload: documentArr})
        })
    }

}


export function fetchFunnel(data) {

    let {funnelObj, property, opts, startDate, endDate} = data;

    let events = [];
    let tableData = [];

    return function (dispatch) {

        _.each(funnelObj.data, (value, key) => {
            events.push(value.event)
        });

        let query = new CB.CloudQuery('_Event');
        let eventsObjArr = [];
        let funnelData = [];
        const firstEvent = (events.splice(0, 1))[0];

        let queryObj = _.filter(funnelObj.data, (value, key) => (value.event === firstEvent));

        if (queryObj[0].includeQuery)
            query = _addFilterQuery(query, null, [queryObj[0]], false);

        query.lessThanEqualTo('createdAt', endDate);
        query.greaterThanEqualTo('createdAt', startDate);
        query.equalTo('name', firstEvent);

        query.distinct('user._id',
            {
                success: (data) => {

                    let counts = _.countBy(data, event => lodash.get(event, 'document.data.' + property));
                    counts.event = firstEvent;
                    tableData.push(counts);

                    eventsObjArr = data;
                    funnelData.push({event: firstEvent, count: eventsObjArr.length});

                    async.eachSeries(
                        events,
                        function (event, done) {

                            let query = new CB.CloudQuery('_Event');
                            let userIdArr = _.map(eventsObjArr, obj => (obj.document.user.document._id));

                            queryObj = _.filter(funnelObj.data, (value, key) => (value.event === event));

                            if (queryObj[0].includeQuery)
                                query = _addFilterQuery(query, null, [queryObj[0]], false);

                            query.containedIn('user._id', userIdArr);
                            query.lessThanEqualTo('createdAt', endDate);
                            query.greaterThanEqualTo('createdAt', startDate);
                            query.equalTo('name', event);
                            query
                                .distinct('user')
                                .then(data => {

                                    counts = _.countBy(data, event => lodash.get(event, 'document.data.' + property));
                                    counts.event = event;
                                    tableData.push(counts);

                                    eventsObjArr = data;
                                    funnelData.push({event, count: eventsObjArr.length});
                                    done();
                                    return Promise.resolve
                                })
                                .catch(err => console.log(err))

                        },
                        function (err) {
                            if (err) {
                                throw err;
                            }
                            else {
                                if (opts)
                                    dispatch({type: 'FUNNEL_REPORT', payload: tableData})
                                else
                                    dispatch({
                                        type: 'FUNNEL_DATA',
                                        payload: {
                                            funnelData,
                                            funnelObj,
                                            tableData
                                        }
                                    })
                            }
                        });

                    return Promise.resolve();
                },

                error: (err) => {
                    console.log(err);
                    return Promise.reject(err)
                }
            })
    };
}

export function getBeacon() {
    return function(dispatch) {
        xhrDashBoardClient.get('/beacon/get').then(response => {
            dispatch({type: 'USER_BEACONS', payload: response.data})
        }).catch(error => {
            console.log(error);
        });

    };
}

export function updateBeacon(beacons, field) {
    return function(dispatch) {
        if (!beacons[field])
            beacons[field] = true;
        xhrDashBoardClient.post('/beacon/update', beacons).then(response => {
            dispatch({type: 'USER_BEACONS', payload: response.data})

        }).catch(error => {
            console.log(error);
        });

    };
}
export function getFunnelDataReport(funnelData, property) {
    let events = []
    let tableData = []
    return ((dispatch) => {
        _.each(funnelData, (value, key) => {
            events.push(value.event)
        })
        let query = new CB.CloudQuery("_Event")
        let firstEvent = events.splice(0, 1)[0]
        if (events.length) {
            query.equalTo('name', firstEvent)
            query.distinct('user._id', {
                success: function(obj) {
                    let counts = _.countBy(obj, (event) => {
                        return lodash.get(event, 'document.data.' + property)
                    });
                    counts.event = firstEvent
                    tableData.push(counts);
                    async.eachSeries(events, function(event, done) {
                        let query = new CB.CloudQuery('_Event');
                        query.equalTo('name', event)
                        query.distinct('user._id').then((obj) => {
                                counts = _.countBy(obj, (event) => {
                                    return lodash.get(event, 'document.data.' + property)
                                });
                                counts.event = event
                                tableData.push(counts);
                                done();

                            });

                    }, function(err) {
                        if (err) {
                            throw err;
                        } else {
                            dispatch({type: 'FUNNEL_REPORT', payload: tableData})
                        }
                    });
                },
                error: function(err) {}
            })
        }

    })
}
export const groupAllEvents = (data) => {
    return ((dispatch) => {

        let documentArr = _.pluck(data, 'document');
        let groupedByDay = groupByTime(documentArr, 'createdAt', 'day');
        let groupedByMonth = groupByTime(documentArr, 'createdAt', 'month');
        let groupedByWeek = groupByTime(documentArr, 'createdAt', 'week');
        let groupedEventsByDay = [];
        let days = (_.keys(groupedByDay));
        let eventsPerDay = ((_.values(groupedByDay)));
        eventsPerDay.forEach((event, i) => {
            groupedEventsByDay[days[i]] = _groupObjects(event)
        })
        let groupedEventsByMonth = [];
        let months = (_.keys(groupedByMonth));
        let eventsPerMonth = ((_.values(groupedByMonth)));
        eventsPerMonth.forEach((event, i) => {
            groupedEventsByMonth[days[i]] = _groupObjects(event)
        })
        let groupedEventsByWeek = [];
        let weeks = (_.keys(groupedByWeek));
        let eventsPerWeek = ((_.values(groupedByWeek)));
        eventsPerWeek.forEach((event, i) => {
            groupedEventsByWeek[days[i]] = _groupObjects(event)
        })
        dispatch({
            type: "GROUP_ALL_EVENTS",
            payload: {
                month: groupedEventsByMonth,
                day: groupedEventsByDay,
                week: groupedEventsByWeek
            }
        });

        //
        // let query = new CB.CloudQuery("_Event")
        // query.limit = 9999999;
        // query.find({
        //     success: function(data) {
        //         let documentArr = _.pluck(data, 'document');
        //         let groupedByDay = groupByTime(documentArr, 'createdAt', 'day');
        //         let groupedByMonth = groupByTime(documentArr, 'createdAt', 'month');
        //         let groupedByWeek = groupByTime(documentArr, 'createdAt', 'week');
        //         let groupedEventsByDay = [];
        //         let days = (_.keys(groupedByDay));
        //         let eventsPerDay = ((_.values(groupedByDay)));
        //         eventsPerDay.forEach((event, i) => {
        //             groupedEventsByDay[days[i]] = _groupObjects(event)
        //         })
        //         let groupedEventsByMonth = [];
        //         let months = (_.keys(groupedByMonth));
        //         let eventsPerMonth = ((_.values(groupedByMonth)));
        //         eventsPerMonth.forEach((event, i) => {
        //             groupedEventsByMonth[days[i]] = _groupObjects(event)
        //         })
        //         let groupedEventsByWeek = [];
        //         let weeks = (_.keys(groupedByWeek));
        //         let eventsPerWeek = ((_.values(groupedByWeek)));
        //         eventsPerWeek.forEach((event, i) => {
        //             groupedEventsByWeek[days[i]] = _groupObjects(event)
        //         })
        //         dispatch({
        //             type: "GROUP_ALL_EVENTS",
        //             payload: {
        //                 month: groupedEventsByMonth,
        //                 day: groupedEventsByDay,
        //                 week: groupedEventsByWeek
        //             }
        //         });
        //     },
        //     error: function(err) {}
        // });
    });
}

export function updateNotificationsSeen() {
    return function(dispatch) {
        xhrDashBoardClient.get('/notification/seen').then(response => {
            dispatch(getNotifications())
        }).catch(error => {
            console.log(error);
        })

    }
}

export function deleteNotificationById(id) {
    return function(dispatch) {
        xhrDashBoardClient.delete('/notification/' + id).then(response => {
            dispatch(getNotifications())
        }).catch(error => {
            console.log(error);
        })

    }
}

export function getNotifications() {
    return function(dispatch) {
        xhrDashBoardClient.get('/notification/0/10').then(response => {
            dispatch({type: 'FETCH_NOTIFICATIONS', payload: response.data})
        }).catch(error => {
            console.log(error);
        })

    }
}

function _groupObjects(objects) {
    let groups = {};
    for (let i = 0; i < objects.length; i++) {
        let groupName = objects[i].name;
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(objects[i]);
    }
    return groups
}

function _addFilterQuery(query, event, obj, addEventFilter, isOrQuery) {
    let queries = [];
    if (addEventFilter)
        query.equalTo('name', event)
    if (isOrQuery) {
        _.each(obj, (queryObj, key) => {
            let field = 'data.' + queryObj.property
            let query = new CB.CloudQuery('_Event')
            //call query functions stored in queryObj.query
            query[queryLabels[queryObj.query]](field, queryObj.value);
            queries.push(query);
        })
    } else {

        _.each(obj, (queryObj, key) => {
            let field = 'data.' + queryObj.property
            //call query functions stored in queryObj.query
            query[queryLabels[queryObj.query]](field, queryObj.value);
        })
    }
    if (isOrQuery) {
        query = CB.CloudQuery.or(queries)
        return query
    } else
        return query;
    }

export function showAlert(type, text) {

    Messenger().post({
        message: text,
        type: type || 'error',
        showCloseButton: true
    });
}

export const logOut = () => {
    xhrDashBoardClient
        .post('/user/logout')
        .then(response => {
            window.location.href = AccountsURL;
        })
        .catch(error => {
            console.log('inside Logout catch error: ');
            console.log(error);
        });
};