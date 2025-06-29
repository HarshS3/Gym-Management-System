const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const config = {
  apiUrl: getApiUrl(),
}; 