import React, { useState, useEffect } from 'react'
import { render } from 'react-dom';
import Sidebar from './loginSignup/Sidebar';


const Header = (props) => {
    const {user, updateUser} = props;
    // const [user, setLoginUser] = useState({})
    // useEffect(() => {
    //     if (localStorage.getItem('MyUser'))
    //         setLoginUser(JSON.parse(localStorage.getItem('MyUser').toString()))
    //     else
    //         setLoginUser(JSON.parse(localStorage.getItem('MyUser')))
    // }, [])

    // const updateUser = (user) => {
    //     localStorage.setItem("MyUser", JSON.stringify(user))
    //     setLoginUser(user)
    // }


    return (
        <div>
            <nav className="navbar navbar-dark bg-dark">
                <a className="navbar-brand" href="/" style = {{'marginLeft': '650px'}}>
                    BlockchainSim
                </a>
                <Sidebar
                    className="btn btn-outline-light"
                    user={user}
                    updateUser={updateUser}
                />
            </nav> <br></br>

        </div>
    )
}

export default Header;