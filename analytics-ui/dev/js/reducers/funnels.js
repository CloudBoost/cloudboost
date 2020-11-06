import _ from 'underscore'
export default function(state = {
    funnels: [],
    funnelNames: [],
    funnelData: [],
    tableData: [],
    funnelObj: {}
}, action) {
    switch (action.type) {
        case 'FETCH_FUNNELS':
            return {
                ...state,
                funnels: action.payload,
                funnelNames: _.pluck(action.payload, 'name')
            }
        case 'FUNNEL_DATA':
            return {
                ...state,
                funnelData: action.payload.funnelData,
                funnelObj: action.payload.funnelObj,
                tableData: action.payload.tableData
            }
        case 'FUNNEL_REPORT':
            return {
                ...state,
                tableData: action.payload
            }

        default:
            return state;
    }
}
