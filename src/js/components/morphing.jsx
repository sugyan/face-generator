import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

export default class Morphing extends React.Component {
    render() {
        return (
            <div>
              <h2>Morphing</h2>
              <FloatingActionButton>
                <ContentAdd />
              </FloatingActionButton>
            </div>
        );
    }
}
