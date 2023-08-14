/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import './Slider.css';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';

const Slider = ({ isOpen, onCloseSlider}) => { // Receive libraryData as a prop
  const sliderRef = useRef(null);
  const [sliderRight, setSliderRight] = useState('-500px');
  const [isClosing, setIsClosing] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');


  useEffect(() => {
    if (isOpen) {
      setSliderRight('0');
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onCloseSlider();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCloseSlider]);

  useEffect(() => {
    if (isClosing) {
      const closeSliderAnimation = setTimeout(() => {
        setSliderRight('-500px');
        setIsClosing(false);
      }, 300);

      return () => {
        clearTimeout(closeSliderAnimation);
      };
    }
  }, [isClosing]);

  return (
    <div
      ref={sliderRef}
      className="slider"
      style={{
        right: sliderRight,
        transition: 'right 0.3s ease',
      }}
    >
    <h2>Enter your MYTH CODE</h2>
        <input
            type="text"
            placeholder="XXXX - XXXX - XXXX - XXXX"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
          />
      <button className='redeem-btn'>REDEEM CODE</button>
    </div>
  );
};

export default Slider;
