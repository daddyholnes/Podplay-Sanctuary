// 🚀 FRONTEND STATUS CHECKER
// Run this in browser console to debug loading issues

console.log('🔍 PODPLAY SANCTUARY FRONTEND DEBUG');
console.log('=====================================');

// Check if React is loaded
console.log('1. React Availability:', typeof React !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Check if main app root exists
const root = document.getElementById('root');
console.log('2. Root Element:', root ? '✅ Found' : '❌ Missing');
console.log('   Root content:', root ? (root.innerHTML.length > 0 ? '✅ Has content' : '❌ Empty') : 'N/A');

// Check network requests
console.log('3. Checking backend connection...');

// Test basic API endpoints
const endpoints = [
    '/health',
    '/api/test-connection', 
    '/api/chat/models',
    '/api/adk-workflows/system/health'
];

endpoints.forEach(endpoint => {
    fetch(endpoint)
        .then(response => {
            console.log(`   ${endpoint}: ${response.ok ? '✅' : '❌'} (${response.status})`);
        })
        .catch(error => {
            console.log(`   ${endpoint}: ❌ Error - ${error.message}`);
        });
});

// Check Socket.io
console.log('4. Socket.io Status:');
if (typeof io !== 'undefined') {
    console.log('   Library: ✅ Available');
    try {
        const testSocket = io(window.location.origin, { path: '/socket.io' });
        testSocket.on('connect', () => {
            console.log('   Connection: ✅ Connected');
            testSocket.disconnect();
        });
        testSocket.on('connect_error', (error) => {
            console.log('   Connection: ❌ Failed -', error.message);
        });
    } catch (error) {
        console.log('   Connection: ❌ Error -', error.message);
    }
} else {
    console.log('   Library: ❌ Not available');
}

// Environment check
console.log('5. Environment Variables:');
console.log('   NODE_ENV:', process?.env?.NODE_ENV || 'undefined');
console.log('   Current URL:', window.location.href);
console.log('   Origin:', window.location.origin);

console.log('=====================================');
console.log('📊 Debug complete - check results above');
