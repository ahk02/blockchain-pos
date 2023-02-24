import React, { useState, useEffect } from "react"
import { render } from 'react-dom';
import axios from 'axios';
import BlockView from './BlockView'
import './BlockView.css'

import { Container } from "react-bootstrap";

// style={{overflowX: "scroll", whiteSpace: "nowrap"}}

const BlockchainViewer = () => {
  const [chain, setChain] = useState([])
  const [click, setClick] = useState({
    click_: 0,
    hash: '',
    index: 0, 
    transactions:[]
  })

  // fetch('/get_chain')
  //   .then(resp => resp.json())
  //   .then(resp => {
  //     setChain(resp.chain)
  //   })

  useEffect(() => {
      const fetchData = async () => {
        const result = await getItems();
        setChain(result.chain);
      }
      fetchData()
    }, [])

    const getItems = async () => {
      try {
        const { data } = await axios.get('/get_chain')
        return data
      } catch (error) {
        console.log(error)
      }
    }


  return (
    <div>
      <div className="container1" style={{ 'marginLeft': '55px' }}>
        <h1>Blocks on chain</h1>
        <p>Each card represents a block on the chain. Click on a block to see the transactions stored inside.</p>
      </div>
      <br />
      <div className="container2" style={{ 'marginLeft': '55px' }}>
        {
          chain.map((element, index) => (
            <BlockView
              setClick={setClick}
              block={element}
              key={index}
              index={index + 1}
            />
          ))
        }
      </div>
      <br></br>
      <>
        {click.click_ ?
          // <span className="block-example border border-secondary">
          <Container>
            <div>
              <h6>Block Hash:  {click.hash} </h6>
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
                </tr>
                {click.transactions.map((element, index) => (
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
                  </tr>
                )
                )
                }

              </tbody>
            </table>
          </Container>
          :
          <></>
        }
      </>
    </div>
  )
}

export default BlockchainViewer;