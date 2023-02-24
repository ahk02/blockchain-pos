import { render } from 'react-dom';
import React, { useState, useEffect } from "react";
import '../../src/App.css';
import axios from 'axios';
import Header from './Header'

const CreateTransaction = () => {

    const [wallets, setWallets] = useState([])

    const [state, setWallet] = useState({
        walletno:0,
        walletname:JSON.parse(localStorage.getItem('MyUser'))[0]._id
    })

    const [user, setUser] = useState({
        toUser: "",
        toAddress:"",
        amount: "",
        fee: ""
    })

    const index = 0
    const string = JSON.parse(localStorage.getItem('MyUser'))
    console.log('wallet',state.walletno)
    // const walletname = string[state.walletno]._id

    const handleChange = e => {
        const { name, value } = e.target
        setUser({
            ...user,
            [name]:value
        })
    }

    const handleChangeWallet = e => {
        //const { name, value } = e.target
        setWallet({
            walletno:Number(e.target.name),
            walletname:JSON.parse(localStorage.getItem('MyUser'))[Number(e.target.name)]._id
        })
    }

    useEffect(() => {
        const fetchData = async () => {
          var transactions = [];
          const resp = await getDetails();
          console.log(resp);
          transactions = resp.wallets;
          setWallets(transactions);
          localStorage.setItem("MyUser",JSON.stringify(resp.wallets))
        }
        fetchData()
      }, [])
    
      const getDetails = async () => {
        try {
          console.log(JSON.parse(localStorage.getItem("MyUser"))[0].uid)
          const { data } = await axios.post('/get_details', {uid: JSON.parse(localStorage.getItem("MyUser"))[0].uid})
          console.log(data)
          return data
        } catch (error) {
          console.log(error)
        }
      }

    const getUserWallet = () => {
        fetch('/chose_wallet', {
            method: 'POST',
            body: JSON.stringify({
                id: user.toUser
                }),
            headers: { 'Content-Type': 'Application/json' }
        }).then(resp => resp.json()).then(resp => { setUser({
            toAddress: resp.wallet_id
        })})
    }
    const createTransaction = () => {
        var fetch = require('cross-fetch')
        fetch('/create_transaction', {
            method: 'POST',
            body: JSON.stringify({
                transactions: [{
                    'from': JSON.parse(localStorage.getItem('MyUser'))[state.walletno]._id,
                    'to': user.toAddress,
                    'amount': user.amount,
                    'fee': user.fee
                }]
            }),
            headers: { 'Content-Type': 'Application/json' }
        }).then(resp => resp.json()).then(resp => { alert(resp.message) })
    }


    return (
        <div>
            <div className="container">
                <h1>Create transaction</h1>
                <p>Transfer some money to someone!</p>
                <br />
                <div className="form-group">
                    <div className="dropdown">
                        <button className="dropbtn" onClick={getDetails}>Choose Wallet</button>
                        <div className="dropdown-content">
                            {wallets.map((element, index) => (
                                <a onClick={handleChangeWallet} name={index}>{element.id}</a>
                            ))}
                        </div>
                    </div>
                    <br/><br/><br/>
                    <p>From address</p>
                    <input type="text" className="form-control" id="fromAddress" aria-describedby="fromAddressHelp" disabled value={state.walletname} />
                    <small id="fromAddressHelp" className="form-text text-muted">
                        This is your wallet address. You cannot change it because you can only spend your own coins.
                    </small>
                </div><br/><br/>
                <div className="form-group">
                    <p>To address</p>
                    <input type="text" className="form-control" id="toUser" aria-describedby="toAddressHelp" onChange={handleChange} name='toUser' value={user.toUser} />
                    <button onClick={getUserWallet} type="submit" className="btn btn-primary">Get user's waller address</button>
                    <input type="text" className="form-control" id="toAddress" aria-describedby="toAddressHelp" onChange={handleChange} name='toAddress' value={user.toAddress} />
                    <small id="toAddressHelp" className="form-text text-muted">
                        The address of the wallet where you want to send the money to. You can type random text here (if you are not interested in recovering the funds)
                    </small>
                </div><br/><br/>
                <div className="form-group">
                    <p>Amount</p>
                    <input type="number" className="form-control" id="amount" aria-describedby="amountHelp" onChange={handleChange} name='amount' value={user.amount} />
                    <small id="amountHelp" className="form-text text-muted">
                        You can transfer any amount.
                    </small>
                </div><br/><br/>
                <div className="form-group">
                    <p>Fee</p>
                    <input type="number" className="form-control" id="fee" onChange={handleChange} name='fee' value={user.fee} />
                    <small className="form-text text-muted">
                        This is the fee to be paid for mining
                    </small>
                </div><br/><br/>
                <button onClick={createTransaction} type="submit" className="btn btn-primary">Sign & create transaction</button>
                {/* <label value = {sign_transaction()}/> */}
            </div>
        </div>
    )
}

export default CreateTransaction;