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
            openDialog: false,
            selectedFaces: [],
            randomFaces: []
        };
    }
    handleClickAddButton() {
        this.setState({
            openDialog: true,
            randomFaces: Array.from(Array(25), () => {
                return Array.from(Array(this.z_dim), () => Math.random() * 2 - 1);
            })
        });
    }
    handleClose() {
        this.setState({
            openDialog: false
        });
    }
    selectFace(face) {
        const faces = this.state.selectedFaces;
        faces.push(face);
        this.setState({
            openDialog: false,
            selectedFaces: faces
        });
    }
    render() {
        const randomFaces = this.state.randomFaces.map((z, i) => {
            return <Face key={i} z={z} onTouchTap={this.selectFace.bind(this)} />;
        });
        const selectedFaces = this.state.selectedFaces.map((f, i) => {
            return <Face key={i} z={f.props.z} src={f.state.src} />;
        });
        return (
            <div>
              <h2>Morphing</h2>
              <Dialog
                  title="Select Face"
                  actions={<FlatButton label="Cancel" primary={true} onTouchTap={this.handleClose.bind(this)} />}
                  modal={true}
                  open={this.state.openDialog}
                  autoScrollBodyContent={true}
                  contentStyle={{ maxWidth:(96 + 10) * 5 + 24 * 2 }}>
                {randomFaces}
              </Dialog>
              <div>{selectedFaces}</div>
              <FloatingActionButton onTouchTap={this.handleClickAddButton.bind(this)}>
                <ContentAdd />
              </FloatingActionButton>
            </div>
        );
    }
}
