
export default function (state = [], action) {
  switch (action.type) {
    case 'FETCH_CARDS': {
      return action.payload;
    }
    case 'RESET': {
      return [];
    }

    default:
      return state;
  }
}
