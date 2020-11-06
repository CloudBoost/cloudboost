import _ from 'underscore'
import {flattenJson} from '../util'
export default function(state = {
    events: [],
    eventsName: [],
    properties: [],
    filteredEvents: [],
    filteredEventsName: [],
    chartFilters: {}
}, action) {
    switch (action.type) {
        case 'FETCH_ALL_EVENTS':
            {
                // const events = [...state.events.concat(action.payload.events)]
                const events = (action.payload.events)
                let allPropertiesObjArray = events.map((event) => {
                    return _.allKeys(flattenJson(event.data))
                });
                const properties = _.uniq(_.flatten(allPropertiesObjArray));
                const eventsName = _.uniq(_.pluck((events), 'name'));
                return {
                    ...state,
                    events,
                    eventsName,
                    properties
                }
            }
        case 'APP_INIT_SUCCESS':
            return { events: [], eventsName: [], properties: [], chartFilters:{} }
        case 'CHANGE_CHART_FILTER':
            {   
                state.chartFilters = action.payload
                state = Object.assign({},state)
                return state
            }
        case 'FILTERED_EVENTS':
            {
                const events = (action.payload.events)
                const eventsName = _.uniq(_.pluck((events), 'name'));
                return {
                    ...state,
                    filteredEvents: events,
                    filteredEventsName: eventsName
                }
            }
        case 'NEW_EVENT':
            {
                const events = [action.payload].concat(...state.events)
                let allPropertiesObjArray = events.map((event) => {
                    return _.allKeys(flattenJson(event.data))
                });
                const properties = _.uniq(_.flatten(allPropertiesObjArray));
                const eventsName = _.uniq(_.pluck((events), 'name'));
                return {
                    ...state,
                    events,
                    eventsName,
                    properties
                }
            }
    }
    return state;
}
