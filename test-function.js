// Test script for the prayer-times Netlify function
const { handler } = require('./netlify/functions/prayer-times.js');

async function testFunction() {
  console.log('Testing prayer-times function...');
  
  // Mock event object
  const mockEvent = {
    httpMethod: 'GET',
    headers: {},
    body: null,
    queryStringParameters: null
  };
  
  // Mock context object
  const mockContext = {};
  
  try {
    const result = await handler(mockEvent, mockContext);
    
    console.log('Function response status:', result.statusCode);
    console.log('Function response headers:', result.headers);
    
    const responseBody = JSON.parse(result.body);
    console.log('Function response body:', responseBody);
    
    // Check if we got valid prayer times
    if (responseBody.fajr && responseBody.dhohr && responseBody.magrib) {
      console.log('✅ SUCCESS: Prayer times retrieved successfully!');
      
      if (responseBody._fallback) {
        console.log('⚠️  WARNING: Using fallback data due to error:', responseBody._error);
      } else {
        console.log('✅ SUCCESS: Live data from islamiskaforbundet.se');
      }
    } else {
      console.log('❌ ERROR: Invalid prayer times format');
    }
    
  } catch (error) {
    console.error('❌ ERROR: Function test failed:', error);
  }
}

testFunction();
