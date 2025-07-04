const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const getFaceApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_FACE_API_URL || '';
  }
  return process.env.REACT_APP_FACE_API_URL || 'http://localhost:5001';
};

export const config = {
  apiUrl: getApiUrl(),
  faceApiUrl: getFaceApiUrl(),
}; 