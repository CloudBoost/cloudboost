import _ from 'underscore'
export default function(state = {
    events: [],
    currentPage: 1,
    eventsName: []
}, action) {
    switch (action.type) {
        case 'FETCH_EVENTS_PAGE':
            return {
                ...state,
                events: (action.payload.events),
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
                eventsName: _.uniq(_.pluck((action.payload.events), 'name'))
            }
        case 'FETCH_EVENTS_PAGE_ADD':
            return {
                ...state,
                events: [...state.events.concat(action.payload.events)],
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
                eventsName: _.uniq(_.pluck([...state.events.concat(action.payload.events)], 'name'))
            }
        case 'APP_INIT_SUCCESS':
            return {events: [], currentPage: 1, eventsName: []}
        case 'NEW_EVENT':
            return {
                ...state,
                events: [action.payload].concat(...state.events),
                eventsName: _.uniq(_.pluck([action.payload].concat(...state.events), 'name'))
            }

    }
    return state;
}
