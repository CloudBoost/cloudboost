/**
 * Created by Jignesh on 29-07-2017.
 */
export default function (state = { openDrawer: false, migrateTo: 'cbApi' }, action) {
  switch (action.type) {
    case 'MiGRATE_AND_TOGGLE':
      return { ...state, ...action.payload };
    case 'TOGGLE_DRAWER':
      return { ...state, openDrawer: action.payload.openDrawer };
    default:
      return state;
  }
}
