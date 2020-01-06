import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron'

export default class ManualPageHeader extends React.Component {

    render() {
        return (
            <Jumbotron fluid className='px-3'>
                <h1>{this.props.chapter}</h1>
                <h3>{this.props.section}</h3>
            </Jumbotron>            
        )
    }
}