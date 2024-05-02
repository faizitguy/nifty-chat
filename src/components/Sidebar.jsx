import React, { useState, useContext } from "react";
import Search from "./Search";
import Chats from "./Chats";
import { Button } from "@chakra-ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { AuthContext } from '../context/AuthContext'

const Sidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const { currentUser, handleLogout } = useContext(AuthContext)

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="sidebarToggle">
      <Button onClick={toggleSidebar}>
          {isSidebarVisible ? <ArrowLeftIcon /> : <ArrowRightIcon />}
      </Button>
      </div>
      {isSidebarVisible && (
        <div className="sidebar">
          <Search />
          <Chats />
          <div className='navbar' style={{ position: 'absolute', bottom: '0', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div className="user">
              <img src={currentUser.photoURL} alt="" />
              <span>{currentUser.displayName}</span>
            </div>
              <div>
              <img className="logoutImg" src="https://cdn.iconscout.com/icon/premium/png-256-thumb/logout-2030711-1713351.png" alt="logout" onClick={() => handleLogout()} />
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
