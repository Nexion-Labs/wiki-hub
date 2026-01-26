import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT);

console.log(`
🚀 Wiki Backend Server Running!

📍 URL: http://${app.server?.hostname}:${app.server?.port}
🌍 Environment: ${env.NODE_ENV}
🔐 CORS Origin: ${env.CORS_ORIGIN}

Available routes:
- GET  /              - API info
- GET  /health        - Health check
- POST /api/auth/register    - Register user
- POST /api/auth/login       - Login
- POST /api/auth/refresh     - Refresh token
- POST /api/auth/logout      - Logout
- GET  /api/auth/me          - Get current user
- PUT  /api/auth/me/password - Change password
`);
