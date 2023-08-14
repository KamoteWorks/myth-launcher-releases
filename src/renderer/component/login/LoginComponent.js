/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import '../login/LoginComponent.css';
import GgLogo from '../../../../assets/icons/gglogo.svg';
import axios from 'axios';
import Titlebar from 'renderer/titlebar/titlebar';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [alertType, setAlertType] = useState();
  const [alertMsg, setAlertMsg] = useState('');
  const [btnDisable, setBtnDisable] = useState(false);
  const { apiUrl } = window.electron.getApiInfo();
  const [isLoading, setIsLoading] = useState(false);

  const delay = async (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const navigate = useNavigate();
  const checkUserLoggedIn = () => {
    setTimeout(() => {
      handleLogin(); // If the user is logged in
    }, 3000);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      login(); // Call the login function when Enter key is pressed
    }
  };

  const handleLogin = async () => {
    try {
      let bearerToken = localStorage.getItem('bearer');

      if (bearerToken !== null) {
        // Send a POST request to our approval API
        let response = true;

        if (response) {
          navigate('/');
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

  useEffect(() => {
    // Initial check when component mounts
    checkUserLoggedIn();

    // Set up the polling interval (every 5 seconds in this example)
    const pollInterval = setInterval(() => {
      checkUserLoggedIn();
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(pollInterval);
  }, []); // Empty dependency array means this effect only runs once when the component mounts

  const login = async () => {
    try {
      setIsLoading(true);
      setAlertType();
      setBtnDisable(true);

      if (email === '') {
        await delay(2000);

        setAlertType(1);
        setAlertMsg('The username/email field should not be empty.');
        setBtnDisable(false);
        setIsLoading(false);
        return;
      }

      if (password === '') {
        await delay(2000);

        setAlertType(1);
        setAlertMsg('The password field should not be empty.');
        setBtnDisable(false);
        setIsLoading(false);
        return;
      }

      let body = {
        username: email,
        email: email,
        password: password,
      };

      let headers = {
        'Content-Type': 'application/json',
      };

      let response = await fetch(`${apiUrl}accounts/login`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const res = await response.json();

      if (res.success) {
        setIsLoading(true);
        await delay(2000);

        localStorage.setItem('user_name', email);
        localStorage.setItem('myth_coins', res.data[0].myth_coins);
        localStorage.setItem('pText_password', password);
        localStorage.setItem('access_token', res.data[0].access_token);
        navigate('Reroute');
      } else {
        await delay(2000);

        setAlertType(1);
        setAlertMsg('Your username/email or password is incorrect.');
        setBtnDisable(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error during the fetch:', error);
      setBtnDisable(false);
    }
  };

  return (
    <div className="login-container">
      <Titlebar />
      <div className="login-form floating-effect-right">
        <img src={GgLogo} alt="" width={70} draggable="false" />
        <br></br>
        <h5>
          SIGN IN <span className="sign-label">/ FILL OUT THE FORM</span>
        </h5>
        <br></br>
        {alertType === 0 && (
          <div className="alert-info">
            <div className="alert-text">{alertMsg}</div>
          </div>
        )}
        {alertType === 1 && (
          <div className="alert-error">
            <div className="alert-text">{alertMsg}</div>
          </div>
        )}
        {alertType === 2 && (
          <div className="alert-success">
            <div className="alert-text">{alertMsg}</div>
          </div>
        )}
        <input
          type="text"
          placeholder="Username/Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="custom-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="custom-input"
        />
        <button onClick={login} disabled={btnDisable || isLoading}>
          {isLoading ? (
            <div className="loading-button-content">
              <div className="loading-circle"></div>
              <span>please wait...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </button>

        <p className="forgot-password-text">
          <span>Forgot your password?</span>
        </p>
        <button className="create-account">Create an Account</button>
      </div>
    </div>
  );
};

export default LoginComponent;
