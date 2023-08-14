// App Imports
import {
  MemoryRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import GgLogo from '../../assets/icons/gglogo.svg';
import logoutIcon from '../../assets/icons/logout.svg';
import sfIcon from '../../assets/img/sflogo.png';
import battlepassIcon from '../../assets/img/battlepass.png';
import shopIcon from '../../assets/img/shop.png';
import redeemIcon from '../../assets/img/redeem.png';
import marketplaceIcon from '../../assets/img/marketplace.png';
import coinIcon from '../../assets/img/coinlogo.png';
// Routers
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Battlepass from './pages/Battlepass';
import Titlebar from './titlebar/titlebar';
import Shop from './pages/Shop';
import Reroute from './pages/Reroute';
import Slider from './component/modal/Slider';

// Import CSS
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
/* eslint-disable */

export default function App() {
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const handleRedeemCode = () => {
    setIsSliderOpen(true);
  };
  const handleCloseSlider = () => {
    setIsSliderOpen(false);
  };
  const handleLogout = async () => {
    localStorage.clear();
  };

  const comingSoon = async () => {
    window.electron.comingSoon();
  };

  let mythCoins = localStorage.getItem('myth_coins');
  return (
    <Router>
      <Titlebar />
      <div className="mythCoin">
        <a
          href="#"
          className="d-flex align-items-center text-white text-decoration-none"
          aria-expanded="false"
        >
          <img src={coinIcon} alt="hugenerd" width="20" height="20" />
          <span className="d-none d-sm-inline mx-1">{mythCoins}</span>
        </a>
      </div>
      {isSliderOpen && (
        <Slider isOpen={isSliderOpen} onCloseSlider={handleCloseSlider} />
      )}
      <div className="container-fluid">
        <div className="row ">
          <div className="sidebar">
            <img
              src={GgLogo}
              alt="logo"
              width={50}
              height={50}
              className="logo"
              draggable="false"
            />
            <ul className="nav">
              <NavLink to="/" className="item-list" draggable="false">
                <span className="sidebarIcon">
                  <img src={sfIcon} alt="" draggable="false" />
                </span>
              </NavLink>
              {/* <NavLink to="/" className="item-list">
                    <span className="sidebarIcon">
                      <img src={cfIcon} alt="" />
                    </span>
                </NavLink> */}
            </ul>
            <a className="logout-btn" onClick={handleLogout} draggable="false">
              <img src={logoutIcon} alt="" draggable="false" />
            </a>
          </div>

          <div className="container">
            <Navbar variant="dark" className="customNav">
              <Nav className="me-auto">
                <NavLink
                  onClick={comingSoon}
                  className="navbar-link"
                  draggable="false"
                >
                  Battlepass
                  <span>Subscription</span>
                  <img src={battlepassIcon} draggable="false" />
                </NavLink>
                <NavLink
                  onClick={comingSoon}
                  className="navbar-link"
                  draggable="false"
                >
                  Myth Coins
                  <span>Top Up</span>
                  <img src={shopIcon} draggable="false" />
                </NavLink>
                <NavLink
                  onClick={comingSoon}
                  className="navbar-link"
                  draggable="false"
                >
                  Marketplace
                  <span>Coming Soon</span>
                  <img src={marketplaceIcon} draggable="false" />
                </NavLink>
                <a className="navbar-link" onClick={comingSoon}>
                  Redeem Code
                  <span>Claim Item</span>
                  <img src={redeemIcon} draggable="false" />
                </a>
              </Nav>
            </Navbar>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Marketplace" element={<Marketplace />} />
        <Route path="/Battlepass" element={<Battlepass />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/Reroute" element={<Reroute />} />
      </Routes>
    </Router>
  );
}
