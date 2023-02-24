import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SidebarData from './SidebarData';
import { IconContext } from 'react-icons/lib';
import LSForm from './LSForm';

// const Nav = styled.div`
//   background: #15171c;
//   height: 80px;
//   display: flex;
//   justify-content: flex-start;
//   align-items: center;
// `;

// const NavIcon = styled(Link)`
//   margin-left: 2rem;
//   font-size: 2rem;
//   height: 80px;
//   display: flex;
//   justify-content: flex-start;
//   align-items: center;
// `;

const SidebarNav = styled.nav`
  background: #15171c;
  width:400px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  right: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

const button_style = {
  width: '100px',
  height: '40px'
}

const Sidebar = (props) => {
  const {user, updateUser} = props;

  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
            <button className="btn btn-outline-light" onClick={showSidebar} style = {button_style}>
            <h5>&#9776;&nbsp;Menu</h5>
            </button>
        <SidebarNav sidebar={sidebar}>
              <button onClick={showSidebar}>
              
              <h3 className="mr-2 hover:text-white">&times;</h3>
              </button>
            <LSForm 
            user={user} 
            updateUser={updateUser}/>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;
