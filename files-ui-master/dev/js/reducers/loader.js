
export default function (state = { loading : true,modal_loading:false,secondary_loading : false }, action) {
    switch (action.type) {
        case 'START_LOADING': {
            return { loading : true }
        }
        case 'START_SECONDARY_LOADING': {
            return { secondary_loading : true }
        }
        case 'START_LOADING_MODAL': {
            return { modal_loading : true }
        }
        case 'STOP_LOADING': {
            return { loading : false }
        }
        case 'STOP_SECONDARY_LOADING': {
            return { secondary_loading : false }
        }
        case 'STOP_LOADING_MODAL': {
            return { modal_loading : false }
        }
        default:
            return state;
    }
}
