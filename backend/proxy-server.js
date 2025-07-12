const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// --- Configuration ---
const FRONTEND_PORT = 3000; // Your local frontend port
const BACKEND_PORT = 5000;  // Your local backend port
const PROXY_PORT = 8080;    // The port this proxy will run on

// --- Proxy Setup ---

// Enable CORS for all requests. This is important for the frontend to communicate.
app.use(cors());

// Proxy API requests to the backend
// Any request to '/api/...' will be forwarded to your backend server
app.use('/api', createProxyMiddleware({
    target: `http://localhost:${BACKEND_PORT}/api`,
    changeOrigin: true, // Needed for virtual hosted sites
     on: {
        proxyReq: (proxyReq, req, res) => {
            console.log(`[Proxy] Forwarding request from ${req.ip} to target: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        },
        error: (err, req, res) => {
            console.error('[Proxy] Error:', err);
        }
    }
}));

// Proxy all other requests to the frontend
// This should be the last middleware
app.use('/', createProxyMiddleware({
    target: `http://localhost:${FRONTEND_PORT}`,
    changeOrigin: true,
}));

// --- Start the Proxy Server ---
app.listen(PROXY_PORT, () => {
    console.log(`Reverse Proxy server is running on http://localhost:${PROXY_PORT}`);
    console.log(`Forwarding /api requests to http://localhost:${BACKEND_PORT}`);
    console.log(`Forwarding all other requests to http://localhost:${FRONTEND_PORT}`);
    console.log('----------------------------------------------------');
    console.log(`Now, run 'ngrok http ${PROXY_PORT}' to get a public URL.`);
});