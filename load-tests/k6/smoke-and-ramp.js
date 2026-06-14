import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
    },
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
  };

  {
    const res = http.get(`${BASE_URL}/courses.html`, { headers });
    check(res, {
      'courses page returns 200': (r) => r.status === 200,
      'courses page has body': (r) => r.body.length > 100,
    });
  }
  {
    const res = http.get(`${BASE_URL}/dashboard.html`, { headers });
    check(res, {
      'dashboard page returns 200': (r) => r.status === 200,
    });
  }
  {
    const res = http.get(`${BASE_URL}/`, { headers });
    check(res, {
      'homepage 200': (r) => r.status === 200,
    });
  }

  sleep(0.5);
}
