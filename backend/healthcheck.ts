#!/usr/bin/env bun

/**
 * Health check script for Docker container
 * Exits with code 0 if healthy, 1 if unhealthy
 */

const HEALTH_ENDPOINT = 'http://localhost:3000/health';
const TIMEOUT = 3000; // 3 seconds

async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(HEALTH_ENDPOINT, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.status === 'ok') {
        console.log('✓ Health check passed');
        process.exit(0);
      }
    }

    console.error('✗ Health check failed: Invalid response');
    process.exit(1);
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    process.exit(1);
  }
}

checkHealth();
