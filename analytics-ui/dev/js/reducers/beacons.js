export default function(state = [], action) {
    switch (action.type) {
        case 'USER_BEACONS':
            {
                return action.payload
            }

        default:
            return state;
    }
}
