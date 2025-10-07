import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(moment());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [blinkingPrayer, setBlinkingPrayer] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Fetch prayer times on component mount
  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const checkIfPrayerTime = useCallback(() => {
    if (!prayerTimes) return;

    const prayerArray = [
      { name: 'fajr', time: prayerTimes.fajr },
      { name: 'shuruk', time: prayerTimes.shuruk },
      { name: 'dhohr', time: prayerTimes.dhohr },
      { name: 'asr', time: prayerTimes.asr },
      { name: 'magrib', time: prayerTimes.magrib },
      { name: 'isha', time: prayerTimes.isha }
    ];

    const nextPrayer = prayerArray.find(prayer =>
      moment(prayer.time, 'HH:mm').isSameOrAfter(moment(currentTime, 'HH:mm'))
    );

    if (nextPrayer && moment(currentTime, 'HH:mm').isSame(moment(nextPrayer.time, 'HH:mm'), 'minute')) {
      setBlinkingPrayer(nextPrayer.name);
      
      // Stop blinking after 1 minute
      setTimeout(() => {
        setBlinkingPrayer(null);
      }, 60000);

      // Play audio notification if not muted
      if (!isMuted) {
        // Note: Audio would need to be added to public folder
        // const audio = new Audio('/azan.mp3');
        // audio.play().catch(console.error);
      }
    }
  }, [prayerTimes, currentTime, isMuted]);

  // Check for prayer time notifications every 6 seconds
  useEffect(() => {
    const prayerCheckInterval = setInterval(() => {
      checkIfPrayerTime();
    }, 6000);

    return () => clearInterval(prayerCheckInterval);
  }, [checkIfPrayerTime]);

  const fetchPrayerTimes = async (isRetry = false) => {
    try {
      if (isRetry) {
        setFetching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch('/.netlify/functions/prayer-times');
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Server responded with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If we can't parse the error response, use the status
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setPrayerTimes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError(err.message);
      setPrayerTimes(null);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };


  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const formatPrayerName = (name) => {
    const nameMap = {
      fajr: 'Fajr',
      shuruk: 'Shuruk',
      dhohr: 'Dhohr',
      asr: 'Asr',
      magrib: 'Magrib',
      isha: 'Isha'
    };
    return nameMap[name] || name;
  };

  if (loading) {
    return (
      <div className={`prayer-times-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <h1>Bönetider</h1>
        <div className="loading">
          <p>Laddar bönetider...</p>
        </div>
      </div>
    );
  }

  if (error && !prayerTimes) {
    return (
      <div className={`prayer-times-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <h1>Bönetider</h1>
        <div className="error-state">
          <p>Kunde inte hämta bönetider</p>
          <button 
            onClick={() => fetchPrayerTimes(true)} 
            disabled={fetching}
            className="retry-button"
          >
            {fetching ? 'Försöker igen...' : 'Försök igen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`prayer-times-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <h1>Bönetider</h1>

      <div className="controls-section">
        <i 
          className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} fa-2x volume-trigger`}
          onClick={toggleMute}
          title={isMuted ? 'Slå på ljud' : 'Stäng av ljud'}
        />
        <i 
          className={`fa-solid ${isDarkTheme ? 'fa-moon' : 'fa-sun'} fa-2x theme-trigger`}
          onClick={toggleTheme}
          title={isDarkTheme ? 'Ljust tema' : 'Mörkt tema'}
        />
      </div>

      <div className="date-section">
        <h2>{currentTime.format('HH:mm')}</h2>
        <h3>{currentTime.format('dddd, MMMM Do YYYY')}</h3>
      </div>

      {fetching && (
        <div className="fetching-indicator">
          <p>Uppdaterar bönetider...</p>
        </div>
      )}

      {prayerTimes && (
        <div className="prayer-container">
          {Object.entries(prayerTimes)
            .filter(([key]) => !['date', '_fallback', '_error'].includes(key))
            .map(([name, time]) => (
              <div key={name} className="prayer">
                <span 
                  className={`prayer-name ${blinkingPrayer === name ? 'blink' : ''}`}
                  id={name}
                >
                  {formatPrayerName(name)}:
                </span>
                <span 
                  className={`prayer-time ${blinkingPrayer === name ? 'blink' : ''}`}
                  id={time}
                >
                  {time}
                </span>
              </div>
            ))}
        </div>
      )}

    </div>
  );
}

export default App;
