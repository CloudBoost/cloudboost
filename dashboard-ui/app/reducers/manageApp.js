/**
 * Created by Darkstar on 1/2/2017.
 */

export default function (state = {}, action) {
  switch (action.type) {
    case 'MANAGE_APP': {
      return {
        ...state,
        viewActive: true,
        appId: action.payload.appId,
        masterKey: action.payload.masterKey,
        jsKey: action.payload.jsKey,
        name: action.payload.name
      };
    }
    case 'SET_TABLE_FILTER' : {
      return { ...state, tableFilter: action.payload };
    }

    default:
      return state;
  }
}
