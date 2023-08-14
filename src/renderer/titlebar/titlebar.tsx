/* eslint-disable */

//App Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize, faSquareFull } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import energyIcon from '../../../assets/icons/energy-icon.svg';

//CSS Imports
import './titlebar.css';

export default function Titlebar() {
  const minWindow = () => {
    console.log('Minimize');
    window.electron.minimizeWindow();
  };

  const maxWindow = () => {
    console.log('Custom maximize behavior: Fullscreen');
    window.electron.maximizeWindow();
  };

  const closeWindow = () => {
    console.log('Close');
    window.electron.closeWindow();
  };

  return (
    <div className="TopBar">

      <div className="btnList">

        <button type="button" className="minBtn" onClick={ minWindow }>
          <FontAwesomeIcon
            icon={faWindowMinimize}
            size={'xs'}
            color={'white'}
          />
        </button>
        {/* <button type="button" className="maxBtn" onClick={ maxWindow }>
          <FontAwesomeIcon
            icon={faSquareFull}
            size={'xs'}
            color={'white'}
          />
        </button> */}
        <button type="button" className="closeBtn" onClick={ closeWindow }>
          <FontAwesomeIcon icon={faXmark} color={'white'} />
        </button>
      </div>
      <p className='version'>V1.0.1</p>
    </div>

  );
}
