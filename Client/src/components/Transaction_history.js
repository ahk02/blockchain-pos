import React, { useEffect, useState } from "react";
import Header from "./Header";

const Transac_history = () => {
    const [user, setUser] = useState({
        transactions_: []
    })

    useEffect(() => {
        var fetch = require('cross-fetch')
        fetch('/all_transactions')
            .then(resp => resp.json())
            .then(resp => { console.log(resp); setUser({ transactions_: resp.transactions }) })
    }, [])

    return (
        <div>
            <div>
                <h1>Transaction History</h1>
                <p>These are the transactions successfully included in a block.</p>
            </div>
            <table className="table table-hover table-striped">
                <tbody>
                    <tr>
                        <th>#</th>
                        <th>Block Number</th>
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

export default Transac_history;