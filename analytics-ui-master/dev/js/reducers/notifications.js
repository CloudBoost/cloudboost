export default function(state = {
    notifications: []
}, action) {
    switch (action.type) {
        case 'FETCH_NOTIFICATIONS':
            {
                return {
                    ...state,
                    notifications: action.payload
                };
            }

        default:
            return state;
    }
}
