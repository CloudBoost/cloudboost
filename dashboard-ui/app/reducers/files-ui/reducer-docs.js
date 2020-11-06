export default function (state = {
  docs: [],
  init: true
}, action) {
  switch (action.type) {
    case 'APP_INIT_SUCCESS':
      return {
        appInitSuccess: true,
        appId: action.payload.appId,
        fileAddSuccess: false,
        docs: [],
        appName: action.payload.appName,
        allApps: action.payload.allApps,
        selectedPage: 1,
        regex: '(.*)',
        init: false,
        userProfilePic: action.payload.userProfilePic,
        downloadingFile: false
      };
    case 'FETCH_APPS': {
      var availableApps = action
        .payload
        .filter((obj) => !obj.deleted);
      // availableApps.forEach((app) => {
      //     allApps.push({name: app.name, id: app.appId});
      // });
      return {
        ...state,
        allApps: availableApps
      }; }
    case 'DELETE_FILE':
      return {
        ...state,
        docs: [
          ...state
            .docs
            .filter((doc) => doc.id !== action.payload)
        ],
        appInitSuccess: false
      };
    case 'FETCHING_ALL_FILES':
      return {
        ...state,
        fetching: true,
        appInitSuccess: false
      };
    case 'FETCH_ALL_FILES':
      if (action.payload.fetchMoreFiles) {
        return {
          ...state,
          docs: [
            ...state
              .docs
              .concat(action.payload.data)
          ],
          fetching: false,
          appInitSuccess: false,
          fileAddSuccess: false,
          selectedPage: action.payload.selectedPage,
          regex: action.payload.regex
        };
      }
      return {
        ...state,
        docs: action.payload.data,
        fetching: false,
        appInitSuccess: false,
        selectedPage: 1,
        regex: action.payload.regex
      };
    case 'TOTAL_FILES':
      return {
        ...state,
        total: action.payload,
        appInitSuccess: false
      };
    case 'ADD_FILE_SUCCESS':
      return {
        ...state,
        percentComplete: 0,
        fileAddSuccess: true,
        uploading: false
      };
    case 'UPLOADING_FILES':
      return {
        ...state,
        uploading: true,
        fileAddSuccess: false
      };
    case 'DOWNLOADING_FILE':
      return {
        ...state,
        downloadingFile: true
      };
    case 'DOWNLOADING_COMPLETE':
      return {
        ...state,
        downloadingFile: false
      };
    case 'SORT_DOCUMENTS':
      return {
        ...state,
        docs: [
          ...state
            .docs
            .sort((a, b) => {
              var x = a[action.payload.key].toLowerCase();
              var y = b[action.payload.key].toLowerCase();
              if (action.payload.isAscending) {
                return ((x < y)
                  ? -1
                  : ((x > y)
                    ? 1
                    : 0));
              } else {
                return ((x < y)
                  ? 1
                  : ((x > y)
                    ? -1
                    : 0));
              }
            }
            )
        ]
      };
  }

  return state;
}
