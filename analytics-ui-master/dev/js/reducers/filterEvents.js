export default function(state = {
    obj: {},
    addEventFilter: true,
    filterEvents: false
}, action) {
    switch (action.type) {
        case 'FILTER_EVENTS':
            {
                return action.payload
            }

        default:
            return state;
    }
}
