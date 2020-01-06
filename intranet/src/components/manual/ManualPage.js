import React from 'react';
import ManualPageHeader from './ManualPageHeader';
import ManualPageContent from './ManualPageContent';

export default class ManualPage extends React.Component {

    render() {
        var chapterNameURL = this.props.match.params.chapter
        var sectionNameURL = this.props.match.params.section

        const renderWithProps = (chapterName, sectionName) => {
            return (
                <div className='mx-4'>
                    <ManualPageHeader chapter={chapterName} section={sectionName}/>
                    <ManualPageContent />
                </div>
            )
        }    

        // check to make sure chapter/section is valid
        const toc = this.props.toc;
        const chapterNames = toc.map( chapter => chapter.name );
        const indexOfMatchingChapter = chapterNames.indexOf(chapterNameURL)
        if(indexOfMatchingChapter >= 0) {
            const sectionNames = toc[indexOfMatchingChapter].section.map ( section => section.name);
            if (sectionNames.includes(sectionNameURL)) {
                return renderWithProps(chapterNameURL, sectionNameURL)
            } else {
                return renderWithProps(chapterNameURL, 'Section Not Found')
            }
        } else {
            return renderWithProps("Chapter not found", '')
        };
    }
}