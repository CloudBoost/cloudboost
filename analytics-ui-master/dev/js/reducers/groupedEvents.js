export default function(state = {}, action) {
    switch (action.type) {
        case 'GROUP_ALL_EVENTS':
            return {
                ...state,
                month: action.payload.month,
                week: action.payload.week,
                day: action.payload.day
            }

    }
    return state;
}
