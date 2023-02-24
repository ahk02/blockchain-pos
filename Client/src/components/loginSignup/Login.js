import React, { useState } from "react"
import './Login.css'
import 'bootstrap/dist/css/bootstrap.min.css'
var fetch = require('cross-fetch')

const Login = ({ updateUser }) => {

    const [user, setUser] = useState({
        email: "",
        password: ""
    })

    const handleChange = e => {
        const { name, value } = e.target
        setUser({
            ...user,
            [name]: value
        })
    }

    const login = () => {
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'email': user.email, 'password': user.password })
        })
            .then(resp => resp.json())
            .then(resp => {
                console.log(resp)
                if (resp.success)
                    updateUser(resp.wallets)
                else
                    alert(resp.message)
            })
    }
    return (
        <div className="formLogin">
                <label htmlFor="chk" aria-hidden="true">Login</label>

                <div className="form-outline mb-4">
                    <input type="email" id="typeEmailX-2" name="email" value={user.email} onChange={handleChange} placeholder="Email" className="form-control form-control-lg" />
                </div>

                <div className="form-outline mb-4">
                    <input type="password" id="typePasswordX-2" name="password" value={user.password} onChange={handleChange} placeholder="Password" className="form-control form-control-lg" />
                </div>

                {/* <div className="form-check d-flex justify-content-start mb-4">
                                        <div>
                                            <input className="form-check-input" type="checkbox" value="" id="form1Example3" />
                                        </div>
                                        <label className="form-check-label" htmlFor="form1Example3"> Remember password </label>
                                    </div> */}

                <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={login}>Login</button>
            </div>
            /* <div>
                                    <p className="mb-0">Don't have an account? <a href = "/signup" className="text-black-50 fw-bold">Sign Up</a>
                                    </p>
                                </div> */
    )
}

export default Login;