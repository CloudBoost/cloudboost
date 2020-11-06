/**
 * Created by Darkstar on 12/5/2016.
 */
export default function (state = {
  isLogggedIn: false,
  user: {},
  notifications: [],
  payments: []
}, action) {
  switch (action.type) {
    case 'LOGOUT':
    {
      return { isLogggedIn: false, user: {} };
    }
    case 'FETCH_USER':
    {
      return Object.assign({}, {
        isLogggedIn: true
      }, action.payload);
    }
    case 'UPDATE_PAYMENT':
    {
      const payments = state.payments.filter(payment => payment._id !== action.payload._id).concat([action.payload]);
      return Object.assign({}, state, { payments });
    }
    default:
      return state;
  }
}
