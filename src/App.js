import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(moment());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [blinkingPrayer, setBlinkingPrayer] = useState(null);

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

  // Check for prayer time notifications every 6 seconds
  useEffect(() => {
    const prayerCheckInterval = setInterval(() => {
      checkIfPrayerTime();
    }, 6000);

    return () => clearInterval(prayerCheckInterval);
  }, [prayerTimes, currentTime]);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/prayer-times');
      
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }
      
      const data = await response.json();
      setPrayerTimes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError(err.message);
      // Fallback to static times if API fails
      setPrayerTimes({
        date: moment().format('YYYY-MM-DD'),
        fajr: '06:26',
        shuruk: '08:54',
        dhohr: '12:17',
        asr: '13:19',
        magrib: '15:31',
        isha: '18:55'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfPrayerTime = () => {
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
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
      <div className="prayer-times-page">
        <h1>Bönetider</h1>
        <div className="loading">
          <p>Laddar bönetider...</p>
        </div>
      </div>
    );
  }

  if (error && !prayerTimes) {
    return (
      <div className="prayer-times-page">
        <h1>Bönetider</h1>
        <div className="error">
          <p>Fel vid hämtning av bönetider: {error}</p>
          <button onClick={fetchPrayerTimes}>Försök igen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="prayer-times-page">
      <h1>Bönetider</h1>

      <div className="controls-section">
        <i 
          className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} fa-3x volume-trigger`}
          onClick={toggleMute}
          title={isMuted ? 'Slå på ljud' : 'Stäng av ljud'}
        />
      </div>

      <div className="date-section">
        <h2>{currentTime.format('HH:mm')}</h2>
        <h3>{currentTime.format('dddd, MMMM Do YYYY')}</h3>
      </div>

      {prayerTimes && (
        <div className="prayer-container">
          {Object.entries(prayerTimes)
            .filter(([key]) => key !== 'date')
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

      {error && (
        <div className="error-notice">
          <small>Använder reservtider på grund av: {error}</small>
        </div>
      )}
    </div>
  );
}

export default App;
