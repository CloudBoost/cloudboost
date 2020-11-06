export default function(state = {
    user: {
        user: {}
    }
}, action) {
    switch (action.type) {
        case 'FETCH_USER':
            return {user: action.payload}

    }
    return state;
}
