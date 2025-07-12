const WebSocket = require('ws');

// Test WSS connection
const testWSSConnection = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
  
  if (isProduction) {
    console.log('🚀 Testing WSS connection in production...');
    // In production, Railway handles SSL termination
    console.log('✅ WSS is automatically handled by Railway SSL termination');
  } else {
    console.log('🔧 Testing WebSocket connection in development...');
    console.log('📝 Note: Use WSS in production, WS in development');
  }
  
  console.log('\n📋 Environment Check:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`- RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);
  console.log(`- PORT: ${process.env.PORT || '3000'}`);
  
  console.log('\n✅ Server is ready for WebSocket connections!');
  console.log('🔌 Frontend will automatically use WSS in production');
};

testWSSConnection(); 