# Prayer Times React App

A modern React application displaying Islamic prayer times for Uddevalla, Sweden, built for deployment on Netlify with serverless functions.

## Features

- **Real-time Prayer Times**: Displays accurate Islamic prayer times (Fajr, Shuruk, Dhohr, Asr, Magrib, Isha)
- **Live Clock**: Shows current time updated every second
- **Prayer Notifications**: Visual blinking alerts when prayer time arrives
- **Audio Controls**: Mute/unmute functionality for prayer notifications
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Glass-morphism design with gradient backgrounds
- **Serverless Backend**: Uses Netlify Functions to fetch prayer times
- **Fallback System**: Shows backup prayer times if external service fails
- **Swedish Interface**: "Bönetider" (Prayer Times in Swedish)

## Technology Stack

- **Frontend**: React 18, JavaScript ES6+, CSS3
- **Backend**: Netlify Functions (Node.js)
- **Deployment**: Netlify
- **External API**: islamiskaforbundet.se (web scraping)
- **Time Library**: Moment.js
- **Icons**: Font Awesome

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Netlify CLI (for local development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prayer-times-react
```

2. Install dependencies:
```bash
npm install
```

3. Install Netlify CLI globally:
```bash
npm install -g netlify-cli
```

### Development

1. Start the development server with Netlify Functions:
```bash
npm run netlify:dev
```

2. Or start just the React app:
```bash
npm start
```

The app will be available at `http://localhost:3000` (React only) or `http://localhost:8888` (with Netlify Functions).

### Building for Production

```bash
npm run build
```

## Deployment to Netlify

### Option 1: Git-based Deployment (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Netlify will automatically build and deploy your app

### Option 2: Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy using Netlify CLI:
```bash
netlify deploy --prod --dir=build
```

## Project Structure

```
prayer-times-react/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── App.js              # Main React component
│   ├── App.css             # Component styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── netlify/
│   └── functions/
│       └── prayer-times.js # Serverless function for fetching prayer times
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## API Endpoints

### GET /.netlify/functions/prayer-times

Returns today's prayer times in JSON format:

```json
{
  "date": "2024-01-15",
  "fajr": "06:26",
  "shuruk": "08:54",
  "dhohr": "12:17",
  "asr": "13:19",
  "magrib": "15:31",
  "isha": "18:55"
}
```

## Configuration

The app is configured for Uddevalla, Sweden by default. To change the location, modify the `postData` in `netlify/functions/prayer-times.js`:

```javascript
const postData = new URLSearchParams({
  'ifis_bonetider_page_city': 'Your City, SE',
  'ifis_bonetider_page_month': today.getMonth() + 1
}).toString();
```

## Features in Detail

### Prayer Time Notifications
- Checks every 6 seconds for prayer time matches
- Triggers blinking animation when prayer time arrives
- Blinking lasts for 1 minute
- Audio notifications can be enabled (requires audio file)

### Responsive Design
- Mobile-first approach
- Adapts to different screen sizes
- Touch-friendly interface

### Error Handling
- Graceful fallback to static prayer times
- User-friendly error messages
- Retry functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Prayer times data from [Islamiska Förbundet](https://www.islamiskaforbundet.se/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Built with [React](https://reactjs.org/) and [Netlify](https://www.netlify.com/)
# prayertimes
