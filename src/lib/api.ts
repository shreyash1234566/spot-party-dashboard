// src/lib/api.ts

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODRiZjJjMTg2MGUzNWQzZjgzZDA1NTIiLCJwaG9uZSI6OTc4MjQxOTE3MywiaWF0IjoxNzUxMzc1Mzc4LCJleHAiOjE3NTE5ODAxNzh9.G2u69cKkBNBodmrUkEQlSemUmA13muAqtfWiQURScH8';

export function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = {
    ...(init.headers || {}),
    'accept': '*/*',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  };
  return fetch(input, { ...init, headers });
}
