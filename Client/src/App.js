import React, { useState, useEffect } from 'react';
import { BrowserRouter, BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Register from './components/loginSignup/Register';
import Home from '../src/components/Home';
import './App.css'
import PendingTransactions from '../src/components/PendingTransactions'
import CreateTransaction from '../src/components/CreateTransaction';
import Details from '../src/components/Details';
import Transac_history from '../src/components/Transaction_history';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header'

function App() {
    
    const [user, setLoginUser] = useState({})
    useEffect(() => {
        if (localStorage.getItem('MyUser'))
            setLoginUser(JSON.parse(localStorage.getItem('MyUser').toString()))
        else
            setLoginUser(JSON.parse(localStorage.getItem('MyUser')))
    }, [])

    const updateUser = (user) => {
        localStorage.setItem("MyUser", JSON.stringify(user))
        setLoginUser(user)
    }

    return (
        <BrowserRouter>
        <Header
        user={user}
        updateUser={updateUser}
        ></Header>
        {
            <Router>
            <div>
        
                    {user?
                    <Switch>
                    <Route path = '/' exact component={Home} />
                    <Route path = '/pending' exact component={PendingTransactions}/>
                    <Route path = '/history' exact component={Transac_history}/>
                    <Route path='/new/transaction' exact component={CreateTransaction}/>
                    <Route path='/signup' exact component={Register} />
                    <Route path='/details'  component={Details}/>
                    </Switch>
                    :
                    <Switch>
                    <Route path = '/' exact component={Home} />
                    <Redirect to = '/' exact component = { Home } />
                    </Switch>
                    }
                
            </div>
            
        </Router>
        }
        </BrowserRouter>
    )
}
export default App; 