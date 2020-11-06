
export default function (state = [], action) {
  switch (action.type) {
    case 'FETCH_APP_SETTINGS': {
      return action.payload;
    }
    case 'RESET_APP_SETTINGS': {
      return [];
    }

    default:
      return state;
  }
}
