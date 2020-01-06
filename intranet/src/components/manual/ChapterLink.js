import React from 'react';
import SectionLink from './SectionLink';
import NavDropdown from 'react-bootstrap/NavDropdown';


export default class ChaperLink extends React.Component {

    render() {
        const SectionLinks = this.props.chapter.section.map( section => {
            return (
                <SectionLink name={section.name} chapterName={this.props.chapter.name} key={this.props.chapter.name + section.name}/>
            )
        })
        
        return(
            <NavDropdown title={this.props.chapter.name} id="basic-nav-dropdown" className='mx-1'>
                {SectionLinks}
            </NavDropdown>
        )
    }
}