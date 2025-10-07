const https = require('https');
const { parse } = require('querystring');

// Helper function to make HTTP requests
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

// Function to parse HTML and extract prayer times
function parsePrayerTimes(html) {
  try {
    // Simple regex-based HTML parsing (for production, consider using a proper HTML parser)
    const tableMatch = html.match(/<tbody[^>]*id=['"']ifis_bonetider['"'][^>]*>(.*?)<\/tbody>/s);
    
    if (!tableMatch) {
      throw new Error('Prayer times table not found');
    }
    
    const tableContent = tableMatch[1];
    const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs);
    
    if (!rows || rows.length === 0) {
      throw new Error('No prayer time rows found');
    }
    
    const today = new Date();
    const currentDay = today.getDate();
    
    // Find today's row
    for (const row of rows) {
      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
      
      if (!cells || cells.length < 7) continue;
      
      // Extract text content from cells
      const cellTexts = cells.map(cell => 
        cell.replace(/<[^>]*>/g, '').trim()
      );
      
      const day = parseInt(cellTexts[0]);
      
      if (day === currentDay) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        
        return {
          date: `${year}-${month}-${dayStr}`,
          fajr: cellTexts[1],
          shuruk: cellTexts[2],
          dhohr: cellTexts[3],
          asr: cellTexts[4],
          magrib: cellTexts[5],
          isha: cellTexts[6]
        };
      }
    }
    
    throw new Error('Today\'s prayer times not found');
  } catch (error) {
    console.error('Error parsing prayer times:', error);
    throw error;
  }
}

// Netlify Function handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Fetching prayer times from islamiskaforbundet.se...');
    
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

    const html = await makeRequest(options, postData);
    const prayerTimes = parsePrayerTimes(html);
    
    console.log('Successfully fetched prayer times:', prayerTimes);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(prayerTimes)
    };
    
  } catch (error) {
    console.error('Error in prayer-times function:', error);
    
    // Return fallback prayer times if the external service fails
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const fallbackTimes = {
      date: `${year}-${month}-${day}`,
      fajr: '06:26',
      shuruk: '08:54',
      dhohr: '12:17',
      asr: '13:19',
      magrib: '15:31',
      isha: '18:55'
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...fallbackTimes,
        _fallback: true,
        _error: error.message
      })
    };
  }
};
