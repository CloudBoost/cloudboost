export default function (state = {
  uploadedFiles: [],
  file: null,
  uploadProgress: 0
}, action) {
  switch (action.type) {
    case 'UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: action.payload.uploadProgress,
        file: action.payload.file,
        up: action.payload.up,
        remainingFiles: action.payload.remainingFiles,
        totalFiles: action.payload.totalFiles,
        uploadFinish: false

      };
    case 'FILES_UPLOADED':
      return {
        ...state,
        uploadedFiles: action.payload,
        file: null,
        uploadFinish: false

      };
    case 'UPLOADING_DONE':
      return {
        ...state,
        file: null,
        uploadedFiles: [],
        uploadFinish: true
      };
  }
  return state;
}
