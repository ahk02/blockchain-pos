import React, { useState, useEffect } from "react"
import './BlockView.css'

export default function BlockView(props) {
    const {block, index, setClick} = props;
    // console.log(blockhash);


    
    const get_block_details = ()=>{

        fetch('/get_block_details', {
            method: 'POST',
            body: JSON.stringify({
                index: block.index
                }),
            
            headers: { 'Content-Type': 'Application/json' }
        }).then(resp => resp.json()).then(resp => { setClick({
            click_:1,
            hash:block.hash,
            index: block.index,
            transactions: resp.transactions
        })})
    }

    return(
        <div className="card" onClick = {get_block_details}>
            <div className="card-body">
                <h5 className="card-title">Block {block.index}</h5>
            </div>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <span className="">Hash</span>
                    <br></br>
                    <div className="text-truncate" >
                        <small name="hash">{ block.hash.substring(0, 20) }...</small>
                    </div>
                    <br></br>
                    <span className="">Hash of previous block</span>
                    <br></br>
                    <div className="text-truncate">
                        <small>{ block.previous_hash.substring(0, 20) }...</small>
                    </div>
                </li>
                <li className="list-group-item">
                    <span className="">Nonce</span><br></br>
                    <div className="text-truncate text-muted">
                        <small>{ block.proof }</small>
                    </div>
                </li>
                <li className="list-group-item">
                    <span className="">Timestamp</span><br></br>
                    <div className="text-truncate text-muted">
                        <small>{ block.timestamp }</small>
                    </div>
                </li>
            </ul>
        </div>
        
    )
}