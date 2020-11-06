export default function (state = {
    isLogggedIn: false,
    user: {},
    notifications: []
}, action) {
    switch (action.type) {
        case 'LOGOUT': {
            return {isLogggedIn: false, user: {}}
        }
        case 'FETCH_USER': {
            return Object.assign({}, {isLogggedIn: true}, action.payload)
        }
        default:
            return state;
    }
}
