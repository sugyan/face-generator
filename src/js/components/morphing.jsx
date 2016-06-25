import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';

import Face from './face.jsx';

export default class Morphing extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.state = {
            open: false,
            faces: []
        };
    }
    handleClickAddButton() {
        this.setState({
            open: true,
            faces: Array.from(Array(25), () => {
                return Array.from(Array(this.z_dim), () => Math.random() * 2 - 1);
            })
        });
    }
    handleClose() {
        this.setState({
            open: false
        });
    }
    render() {
        const faces = this.state.faces.map((z, i) => <Face key={i} z={z} />);
        return (
            <div>
              <h2>Morphing</h2>
              <Dialog
                  title="Select Face"
                  actions={<FlatButton label="Cancel" primary={true} onTouchTap={this.handleClose.bind(this)} />}
                  modal={true}
                  open={this.state.open}
                  autoScrollBodyContent={true}
                  contentStyle={{ maxWidth:(96 + 10) * 5 + 24 * 2 }}>
                {faces}
              </Dialog>
              <FloatingActionButton onTouchTap={this.handleClickAddButton.bind(this)}>
                <ContentAdd />
              </FloatingActionButton>
            </div>
        );
    }
}
