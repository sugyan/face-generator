import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentClear from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import { List } from 'immutable';

import Face from './face.jsx';

export default class Morphing extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.state = {
            openDialog: false,
            selectedFaces: List.of(),
            randomFaces: List.of()
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
    handleClickClearButton(i) {
        this.setState({
            selectedFaces: this.state.selectedFaces.splice(i, 1)
        });
    }
    handleClose() {
        this.setState({
            openDialog: false
        });
    }
    selectFace(face) {
        this.setState({
            openDialog: false,
            selectedFaces: this.state.selectedFaces.push(face)
        });
    }
    render() {
        const randomFaces = this.state.randomFaces.map((z, i) => {
            return (
                <Face key={i} z={z} onTouchTap={this.selectFace.bind(this)} />
            );
        });
        const selectedFaces = this.state.selectedFaces.map((f, i) => {
            return (
                <div key={f.key}>
                  <Face z={f.props.z} src={f.state.src} />
                  <FloatingActionButton mini={true} secondary={true} onTouchTap={this.handleClickClearButton.bind(this, i)}>
                    <ContentClear />
                  </FloatingActionButton>
                </div>
            );
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
