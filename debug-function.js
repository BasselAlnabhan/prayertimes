// Debug script to check what HTML we're receiving
const https = require('https');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function debugRequest() {
  console.log('Testing direct request to islamiskaforbundet.se...');
  
  try {
    const today = new Date();
    const postData = new URLSearchParams({
      'ifis_bonetider_page_city': 'Uddevalla, SE',
      'ifis_bonetider_page_month': today.getMonth() + 1
    }).toString();

    const options = {
      hostname: 'www.islamiskaforbundet.se',
      port: 443,
      path: '/wp-content/plugins/bonetider/Bonetider_Widget.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://www.islamiskaforbundet.se',
        'Referer': 'https://www.islamiskaforbundet.se/bonetider/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    console.log('Making request with data:', postData);
    const html = await makeRequest(options, postData);
    
    console.log('Response length:', html.length);
    console.log('First 500 characters of response:');
    console.log(html.substring(0, 500));
    
    // Check for table
    const tableMatch = html.match(/<tbody[^>]*id=['"']ifis_bonetider['"'][^>]*>/);
    if (tableMatch) {
      console.log('✅ Found table with id="ifis_bonetider"');
    } else {
      console.log('❌ Table with id="ifis_bonetider" not found');
      
      // Check for any table
      const anyTable = html.match(/<table[^>]*>/);
      if (anyTable) {
        console.log('Found other table:', anyTable[0]);
      }
      
      // Check for tbody
      const anyTbody = html.match(/<tbody[^>]*>/);
      if (anyTbody) {
        console.log('Found tbody:', anyTbody[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

debugRequest();
