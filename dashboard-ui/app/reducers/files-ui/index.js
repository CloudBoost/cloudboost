import DocumentReducer from './reducer-docs';
import UploadingDocs from './reducer-uploading-docs';

export const filesUIReducers = {
  documents: DocumentReducer,
  uploadingFiles: UploadingDocs
};
