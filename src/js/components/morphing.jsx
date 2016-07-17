import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import { List, Map } from 'immutable';
import 'whatwg-fetch';

import Face from './face.jsx';

class SelectFaceDialog extends React.Component {
    componentDidMount() {
    }
    render() {
        const faces = this.props.faces.map((face, i) => {
            return (
                <Face key={i} src={face.get('src')} />
            );
        });
        return (
            <Dialog
                title="Select Face"
                actions={<FlatButton label="Cancel" primary={true} onTouchTap={this.props.onTouchTapCancelButton.bind(this)} />}
                modal={true}
                open={this.props.open}
                autoScrollBodyContent={true}
                contentStyle={{ maxWidth:(96 + 10) * 5 + 24 * 2 }}>
              {faces}
            </Dialog>
        );
    }
}

export default class Morphing extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.state = {
            dialog: Map({
                open: false,
                faces: List()
            }),
            selectedFaces: List.of(),
            randomFaces: List.of()
        };
    }
    handleClickAddButton() {
        const faces = List(Array.from(Array(25), () => Map({
            z: Array.from(Array(this.z_dim), () => Math.random() * 2 - 1)
        })));
        this.setState({
            dialog: this.state.dialog
                        .set('open', true)
                        .set('faces', faces)
        });
        faces.forEach((f, i) => {
            fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(f.get('z'))
            }).then((response) => {
                return response.json();
            }).then((json) => {
                this.setState({
                    dialog: this.state.dialog.updateIn(['faces'], (faces) => {
                        return faces.updateIn([i], (face) => {
                            return face.set('src', json.result);
                        });
                    })
                });
            });
        });
    }
    handleCancelButton() {
        this.setState({
            dialog: this.state.dialog.set('open', false)
        });
    }
    handleClickClearButton(i) {
        this.setState({
            selectedFaces: this.state.selectedFaces.splice(i, 1)
        });
    }
    selectFace(face) {
        this.setState({
            openDialog: false,
            selectedFaces: this.state.selectedFaces.push(face)
        });
    }
    render() {
        const selectedFaces = undefined;
        return (
            <div>
              <h2>Morphing</h2>
              <SelectFaceDialog
                  faces={this.state.dialog.get('faces')}
                  open={this.state.dialog.get('open')}
                  onTouchTapCancelButton={this.handleCancelButton.bind(this)} />
              <div>{selectedFaces}</div>
              <FloatingActionButton onTouchTap={this.handleClickAddButton.bind(this)}>
                <ContentAdd />
              </FloatingActionButton>
            </div>
        );
    }
}
