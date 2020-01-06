import React from 'react';

import ChapterLink from './ChapterLink';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


export default class ManualNavBar extends React.Component {
    render() {
        const ChapterLinks = this.props.toc.map( chapter => {
            return (
                <ChapterLink chapter={chapter} key={chapter.name}/>
            )
        }
            
        )
        
        return (
            <Navbar variant="dark" bg="dark" expand="lg">
                <Navbar.Brand href="#home">
                    <img height="30px" src="/img/home/manual_icon.png"></img>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        {ChapterLinks}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}