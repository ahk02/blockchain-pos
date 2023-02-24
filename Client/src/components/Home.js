import React from 'react'
import { render } from 'react-dom';
import Header from './Header.js';
import BlockchainViewer from './BlockchainViewer';

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <BlockchainViewer/>
            </div>
        )
    }
}

export default Home;