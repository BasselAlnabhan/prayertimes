// Test the API endpoint directly
const https = require('https');

function testLocalFunction() {
  const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/.netlify/functions/prayer-times',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (response.fajr && response.dhohr && response.magrib) {
          console.log('✅ SUCCESS: Valid prayer times received!');
          
          if (response._fallback) {
            console.log('⚠️  Using fallback data due to:', response._error);
          } else {
            console.log('✅ Live data from external source');
          }
        } else {
          console.log('❌ Invalid response format');
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.error('❌ Failed to parse JSON:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error);
    
    // Try HTTP instead
    console.log('Trying HTTP instead...');
    testLocalFunctionHTTP();
  });

  req.end();
}

function testLocalFunctionHTTP() {
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/.netlify/functions/prayer-times',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    console.log('HTTP Status Code:', res.statusCode);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('HTTP Response:', response);
        
        if (response.fajr && response.dhohr && response.magrib) {
          console.log('✅ SUCCESS: Valid prayer times received via HTTP!');
          
          if (response._fallback) {
            console.log('⚠️  Using fallback data due to:', response._error);
          } else {
            console.log('✅ Live data from external source');
          }
        } else {
          console.log('❌ Invalid response format');
        }
      } catch (error) {
        console.log('Raw HTTP response:', data);
        console.error('❌ Failed to parse JSON:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ HTTP Request also failed:', error);
  });

  req.end();
}

console.log('Testing Netlify function at localhost:8888...');
setTimeout(() => {
  testLocalFunction();
}, 2000); // Wait 2 seconds for server to be ready
