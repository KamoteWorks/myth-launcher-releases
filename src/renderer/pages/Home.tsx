import React, { useState, useEffect, useRef } from 'react';
import library from '../../../assets/json/library.json';
import SFBackground from '../../../assets/img/sf-bg.png';
import playIcon from '../../../assets/icons/play.svg';
import updateIcon from '../../../assets/icons/update.svg';
import LoginComponent from '../component/login/LoginComponent';

/* eslint-disable */

export default function Home() {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isUpdated, setUpdate] = useState(true);
  const [isClientInstalled, setClientInstall] = useState(true);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [progress, setProgress] = useState(100);
  const [progressText, setProgressText] = useState('');
  const [runningState, setRunningState] = useState(false);
  const [wasCalled, setWasCalled] = useState(false);
  const styles = {
    progressBar: {
      position: 'fixed',
      width: '70%',
      height: '10px',
      backgroundColor: '#b6b6b650',
      borderRadius: '10px',
      bottom: '90px',
    },
    progressFill: {
      position: 'absolute',
      top: '0',
      left: '0',
      height: '100%',
      backgroundColor: '#90d8ff',
      width: `${progress}%`,
      borderRadius: '10px',
      boxShadow: '0 0px 10px #3eb1f2',
    },
    progress: {
      color: '#9DA3A6',
      position: 'absolute',
      left: '140px',
      bottom: '40px',
      textTransform: 'uppercase',
    },
    progressBlink: {
      color: '#9DA3A6',
      position: 'absolute',
      left: '140px',
      bottom: '40px',
      textTransform: 'uppercase',
      animation: 'blinking 1s infinite',
    },
    contentUpdates: {
      position: 'fixed',
      height: '450px',
      width: '680px',
      top: '190px',
      left: '140px',
      backgroundColor: '#3f3f3f2f',
      backdropFilter: 'blur(10px)',
      borderRadius: '5px',
      backgroundImage: 'url("https://imgur.com/a6OntUo.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    news: {
      position: 'fixed',
      height: '450px',
      width: '350px',
      top: '190px',
      right: '40px',
      backgroundColor: '#3f3f3f2f',
      backdropFilter: 'blur(10px)',
      borderRadius: '5px',
      backgroundImage: 'url("https://imgur.com/sJ6t7dj.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  };
  useEffect(() => {
    //Progress bar and text
    const progressListener = (data: any) => {
      setProgress(data.progress);
      setProgressText(data.progressText);
      setRunningState(data.runningState);
      console.log(data);
    };
    window.electron.ipcRenderer.on('patch-files-response', progressListener);

    //Check if client is installed
    const installListener = (status: any) => {
      setClientInstall(status);
      console.log(status);
    };
    window.electron.ipcRenderer.on('installed-response', installListener);

    //Check for updates
    const updateListener = (status: any) => {
      setUpdate(status);
      console.log(status);
    };
    window.electron.ipcRenderer.on('update-response', updateListener);

    //Set button enabled/disabled
    const buttonListener = (status: any) => {
      setButtonDisabled(status);
      console.log(status);
    };
    window.electron.ipcRenderer.on('button-disabled-response', buttonListener);
  }, []);

  const handleLogin = async () => {
    try {
      let bearerToken = localStorage.getItem('access_token');

      if (bearerToken !== null) {
        // Send a POST request to our approval API
        let response = true;

        if (response) {
          setisLoggedIn(false);
        } else {
          setisLoggedIn(true);
        }
      } else {
        setisLoggedIn(true);
      }
    } catch (error) {
      setisLoggedIn(true);
      console.error('Error during the fetch:', error);
    }
  };
  const checkUserLoggedIn = () => {
    handleLogin(); // If the user is logged in
  };
  // Use the useEffect hook to check user login status when the page loads
  useEffect(() => {
    // Initial check when component mounts
    checkUserLoggedIn();

    // Set up the polling interval (every 5 seconds in this example)
    const pollInterval = setInterval(() => {
      checkUserLoggedIn();
    }, 1000); // 5000 milliseconds = 5 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(pollInterval);
  }, []); // Empty dependency array means this effect only runs once when the component mounts

  const handleLaunchGame = () => {
    window.electron.launchGame();
  };

  const handleInstallGame = () => {
    window.electron.downloadGameFiles();
  };

  const handleRepairGamefiles = () => {
    window.electron.repairGameFiles();
  };

  const handleCheckClient = (user: any, pass: any) => {
    window.electron.checkClient(user, pass);
  };

  const handleTryUpdate = () => {
    window.electron.tryUpdate();
  };

  useEffect(() => {
    if (wasCalled) return;
    setWasCalled(true);
    const user = localStorage.getItem('user_name');
    const pass = localStorage.getItem('pText_password');
    handleCheckClient(user, pass);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes blinking {

            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>

      {isLoggedIn && <LoginComponent></LoginComponent>}

      <div className="home">
        {/* <div className='upcoming-update'>
        </div> */}
        <img
          src={SFBackground}
          className="game-backgound floating-effect"
          draggable="false"
        />
        {isClientInstalled && isUpdated && (
          <div>
            {!isButtonDisabled ? (
              <button
                id="launch-button"
                onClick={handleLaunchGame}
                draggable="false"
              >
                <img
                  src={playIcon}
                  alt="Image"
                  id="play-btn-image"
                  draggable="false"
                />
                play
              </button>
            ) : (
              <button id="launch-disabled-button">
                <img
                  src={playIcon}
                  alt="Image"
                  id="play-btn-image"
                  draggable="false"
                />
                play
              </button>
            )}
          </div>
        )}
        {!isUpdated && (
          <button
            id="update-button"
            onClick={handleTryUpdate}
            draggable="false"
          >
            <img
              src={updateIcon}
              alt="update"
              id="play-btn-image"
              draggable="false"
            />
            update
          </button>
        )}
        {!isClientInstalled && (
          <button
            id="install-button"
            onClick={handleInstallGame}
            draggable="false"
          >
            <img
              src={updateIcon}
              alt="install"
              id="play-btn-image"
              draggable="false"
            />
            install
          </button>
        )}
        <div style={styles.contentUpdates}>
          <a className="content-update-label">content updates</a>
        </div>
        <div style={styles.news}>
          <a className="news-label">news</a>
        </div>
        {isClientInstalled && isUpdated && (
          <div>
            <div className="progress-wrapper">
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
            </div>
            {progressText ? (
              <p style={styles.progress}>{progressText}</p>
            ) : (
              <p style={styles.progressBlink}>CLICK PLAY TO START GAME</p>
            )}
            {runningState ? (
              <p style={styles.progressBlink}>
                Instance running: specialforce.exe
              </p>
            ) : null}
            {!isButtonDisabled ? (
              <div className="repair-wrapper">
                <button id="repair-button" onClick={handleRepairGamefiles}>
                  Repair
                </button>
              </div>
            ) : (
              <div className="repair-disabled-wrapper">
                <button id="repair-button">Repair</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
