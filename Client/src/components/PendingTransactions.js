import React, { useEffect, useState } from "react"
import Header from "./Header";

const PendingTransactions = () => {

    const [user, setUser] = useState({
        transactions_: []
    })

    const [wallets, setWallets] = useState({
        wallets: []
    })

    const [state, setWallet] = useState({
        walletno: 0,
        walletname: undefined//JSON.parse(localStorage.getItem('MyUser'))[0]._id
    })

    var transactions = [];
    fetch('/pending_trans')
        .then(resp => resp.json())
        .then(resp => {
            transactions = resp.pool;
            setUser({
                transactions_: transactions
            })
        });

    const handleChangeWallet = e => {
        //const { name, value } = e.target
        setWallet({
            walletno: Number(e.target.name),
            walletname: JSON.parse(localStorage.getItem('MyUser'))[Number(e.target.name)]._id
        })
    }

    const getDetails = () => {
        var transactions = [];
        console.log(JSON.parse(localStorage.getItem("MyUser"))[0].uid)
        fetch('/get_details', {
            method: 'POST',
            body: JSON.stringify({
                uid: JSON.parse(localStorage.getItem("MyUser"))[0].uid
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(resp => resp.json())
            .then(resp => {
                transactions = resp.wallets;
                setWallets({
                    wallets: transactions
                })
                localStorage.setItem("MyUser", JSON.stringify(resp.wallets))
            });
        //window.location.href = '/details';
    }

    const minePendingTransactions = () => {
        if (state.walletname) {
            var fetch = require('cross-fetch')
            fetch('/mine_block_auto', {
                method: 'POST',
                body: JSON.stringify({
                    add: state.walletname
                }),
                headers: { 'Content-Type': 'Application/json' }
            }).then(resp => resp.json()).then(resp => alert(resp.message))
        }
        else
            alert('Please choose a wallet first...')
    }

    return (
        <div>
            <div className="container">
                <h1>Pending transactions</h1>
                <p>These transactions are waiting to be included in the next block. Next block is created when you start the mining process.</p>
            </div>
            <table className="table table-hover table-striped">
                <tbody>
                    <tr>
                        <th>#</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Fee</th>
                        <th>Valid?</th>
                    </tr>
                    {user.transactions_.map((element, index) => (
                        <tr>
                            <td>
                                {index + 1}
                            </td>
                            <td>
                                {element.from}
                            </td>
                            <td>
                                {element.to}
                            </td>
                            <td>
                                {element.amount}
                            </td>
                            <td>
                                {element.fee}
                            </td>
                            <td>
                                ✓
                            </td>
                        </tr>
                    )
                    )
                    }

                </tbody>
            </table>
            <div className="dropdown">
                <p>Wallet Chosen: 
                    {
                    state.walletname ? <p>{state.walletname}</p>: <p>None</p>}
                </p>
                <button className="btn btn-primary" onClick={getDetails}>Choose Wallet</button>
                <div className="dropdown-content">
                    {wallets.wallets.map((element, index) => (
                        <a onClick={handleChangeWallet} name={index}>{element.id}</a>
                    ))}
                </div>
            </div>
            &nbsp;&nbsp;
            <button className="btn btn-primary" onClick={minePendingTransactions}>
                Start mining
            </button>
        </div>
    )
}

export default PendingTransactions;