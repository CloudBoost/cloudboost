import {combineReducers} from 'redux';
import DocumentReducer from './reducer-docs';
import UploadingDocs from './reducer-uploading-docs';
import beacons from './beacons';
import notifications from './notifications';
import user from './user';
import loader from './loader';
import drawer from './drawer';

const allReducers = combineReducers({
    documents: DocumentReducer,
    uploadingFiles: UploadingDocs,
    beacons,
    notifications,
    user,
    loader,
    drawer
});

export default allReducers
