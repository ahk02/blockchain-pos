import React, { useState } from "react";
import Header from "./Header";
const Details = () => {
    const index = window.location.href.split('/')[4]
    const string = JSON.parse(localStorage.getItem('MyUser'))
    const [state, setState] = useState({
        balance: JSON.parse(localStorage.getItem('MyUser'))[index].balance
    })
    const [user, setUser] = useState({
        status: 0,
        transactions_: []
    })
    const getTrans = () => {
        fetch('/get_transactions', {
            method: 'POST',
            body: JSON.stringify({ add: JSON.parse(localStorage.getItem('MyUser'))[index]._id }),
            headers: { 'Content-Type': 'Application/json' }
        }).then(resp => resp.json())
            .then(resp => {
                setUser({
                    status:1,
                    transactions_: resp.transactions
                })
            })
    }
    const Headings = () => {
        if (user.status)
            return (
                <tr>
                    <th>#</th>
                    <th>Block Number</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Valid?</th>
                </tr>
            )
        else
            return(
                <div></div>
            )
    }
    const getMore = () => {
        fetch('/get_more', {
            method: 'POST',
            body: JSON.stringify({ _id: JSON.parse(localStorage.getItem('MyUser'))[index]._id }),
            headers: { 'Content-Type': 'Application/json' }
        }).then(resp => resp.json())
            .then(resp => {
                console.log(resp)
                alert(resp.message);
                var storage = JSON.parse(localStorage.getItem("MyUser"))
                storage[index].balance = resp.balance
                localStorage.setItem("MyUser",JSON.stringify(storage))
                setState({
                    balance: resp.balance
                })
            })
    }
    return (
        <div>
            <h1>&nbsp;&nbsp;Details</h1>
            <div style={{ 'margin': '24px', 'border': '2px solid black'}}>
                <p><span style = {{fontWeight: 'bold'}}>&nbsp;Wallet Name: </span>{string[index].id}</p>
                <p><span style = {{fontWeight: 'bold'}}>&nbsp;Wallet Address: </span>{string[index]._id}</p>
                <p><span style = {{fontWeight: 'bold'}}>&nbsp;Wallet Balance: </span>{state.balance}</p>
            </div >
            <button style = { {'margin' : '24px'}} type="button" className='btn btn-primary' onClick={getMore}>
                Receive Dummy Credits
            </button>
            <br/>
            <div>
                <h3 style = { {'margin' : '24px'}}>Transactions</h3>
                <p style = { {'margin' : '24px'}}>Click <a onClick={getTrans} style={{'color':'blue'}}>here</a> to see the transactions associated with this wallet!</p>
            </div>
            <table className="table table-hover table-striped">
                <tbody>
                    <Headings />
                    {user.transactions_.map((element, index) => (
                        <tr>
                            <td>
                                {index + 1}
                            </td>
                            <td>
                                {element.blockno}
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
        </div>
    )
}

export default Details;