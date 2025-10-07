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
    console.log('Parsing HTML for prayer times...');
    
    // Find the tbody with id="ifis_bonetider"
    const tableMatch = html.match(/<tbody[^>]*id=['"']ifis_bonetider['"'][^>]*>(.*?)<\/tbody>/s);
    
    if (!tableMatch) {
      console.log('Table with id="ifis_bonetider" not found');
      throw new Error('Prayer times table not found');
    }
    
    const tableContent = tableMatch[1];
    console.log('Found table content, length:', tableContent.length);
    
    // The HTML structure shows that <tr> tags are not properly closed, so we need to handle this
    // Split by <tr and then extract the data
    const rowParts = tableContent.split('<tr');
    
    const today = new Date();
    const currentDay = today.getDate();
    
    console.log(`Looking for day ${currentDay} in ${rowParts.length} row parts`);
    
    // First, try to find the row with class "today"
    for (const rowPart of rowParts) {
      if (rowPart.includes('class="odd today"') || rowPart.includes('class="even today"')) {
        console.log('Found today row by class');
        const cells = rowPart.match(/<td[^>]*>(.*?)<\/td>/g);
        
        if (cells && cells.length >= 6) {
          const cellTexts = cells.map(cell => 
            cell.replace(/<[^>]*>/g, '').trim()
          );
          
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(currentDay).padStart(2, '0');
          
          const result = {
            date: `${year}-${month}-${day}`,
            fajr: cellTexts[1],
            shuruk: cellTexts[2],
            dhohr: cellTexts[3],
            asr: cellTexts[4],
            magrib: cellTexts[5],
            isha: cellTexts[6]
          };
          
          console.log('Found today\'s prayer times by class:', result);
          return result;
        }
      }
    }
    
    // If not found by class, look for the current day number
    for (const rowPart of rowParts) {
      const cells = rowPart.match(/<td[^>]*>(.*?)<\/td>/g);
      
      if (!cells || cells.length < 6) continue;
      
      const cellTexts = cells.map(cell => 
        cell.replace(/<[^>]*>/g, '').trim()
      );
      
      const day = parseInt(cellTexts[0]);
      
      if (day === currentDay) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        
        const result = {
          date: `${year}-${month}-${dayStr}`,
          fajr: cellTexts[1],
          shuruk: cellTexts[2],
          dhohr: cellTexts[3],
          asr: cellTexts[4],
          magrib: cellTexts[5],
          isha: cellTexts[6]
        };
        
        console.log('Found today\'s prayer times by day number:', result);
        return result;
      }
    }
    
    // If still not found, get the first valid row for debugging
    console.log('Could not find today\'s specific day, trying first valid row...');
    for (const rowPart of rowParts) {
      const cells = rowPart.match(/<td[^>]*>(.*?)<\/td>/g);
      
      if (!cells || cells.length < 6) continue;
      
      const cellTexts = cells.map(cell => 
        cell.replace(/<[^>]*>/g, '').trim()
      );
      
      // Check if this looks like a valid prayer time row
      if (cellTexts[1] && cellTexts[1].match(/^[0-9]{1,2}:[0-9]{2}$/)) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const result = {
          date: `${year}-${month}-${day}`,
          fajr: cellTexts[1],
          shuruk: cellTexts[2],
          dhohr: cellTexts[3],
          asr: cellTexts[4],
          magrib: cellTexts[5],
          isha: cellTexts[6]
        };
        
        console.log('Using first valid row as fallback:', result);
        return result;
      }
    }
    
    throw new Error('No valid prayer times found in table');
  } catch (error) {
    console.error('Error parsing prayer times:', error);
    console.log('HTML sample (first 500 chars):', html.substring(0, 500));
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
    console.log('Received HTML response, length:', html.length);
    
    const prayerTimes = parsePrayerTimes(html);
    
    console.log('Successfully fetched prayer times:', prayerTimes);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(prayerTimes)
    };
    
  } catch (error) {
    console.error('Error in prayer-times function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch prayer times',
        message: error.message
      })
    };
  }
};
