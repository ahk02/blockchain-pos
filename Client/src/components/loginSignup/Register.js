import React, { useState } from "react"
import './Login.css'
import 'bootstrap/dist/css/bootstrap.min.css'
var fetch = require('cross-fetch')


const Register = () => {
    const [user, setUser] = useState({
        email: "",
        password: "",
        reEnterPassword: ""
    })

    const handleChange = e => {
        const { name, value } = e.target
        setUser({
            ...user,
            [name]: value
        })
    }

    const register = () => {
        const { email, password, reEnterPassword } = user
        if (email && password && (password === reEnterPassword)) {
            console.log("b4:", user)
            fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'email': user.email, 'password': user.password })
            }).then(resp => resp.json()).then(resp => console.log(resp))

        } else {
            alert("invalid input")
        }

    }

    return (
        <div className="formSignup">

            <label htmlFor="chk" aria-hidden="true">Sign up</label>

            <div className="form-outline mb-4">
                <input type="email" id="typeEmailX-2" name='email' value={user.email} placeholder="Email" onChange={handleChange} className="form-control form-control-lg" />
            </div>

            <div className="form-outline mb-4">
                <input type="password" id="typePasswordX-2" name='password' value={user.password} placeholder="Password" onChange={handleChange} className="form-control form-control-lg" />
            </div>

            <div className="form-outline mb-4">
                <input type="password" id="typePasswordX-3" name='reEnterPassword' value={user.reEnterPassword} placeholder="Re-Enter Password" onChange={handleChange} className="form-control form-control-lg" />
            </div>
            
            <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={register}>Sign up</button>
        </div>
    )
}

export default Register