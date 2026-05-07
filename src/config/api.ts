// API Configuration
export const API_CONFIG = {
  // Change this to your backend URL
  // For Android emulator: use 10.0.2.2
  // For physical device: use your computer's IP address (e.g., 192.168.1.x)
  BASE_URL: __DEV__ ? 'http://172.168.1.95:8000' : 'https://api.solmate.app',
  ENDPOINTS: {
    CHALLENGE: '/v1/users/challenge',
    ONBOARD: '/v1/users/onboard',
    ME: '/v1/users/me',
  },
};
