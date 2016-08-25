import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import { List, Map } from 'immutable';
import 'whatwg-fetch';

import Face from './face.jsx';

class SelectFaceDialog extends React.Component {
    handleTouchTapFace(i) {
        if (this.props.onSelectFace) {
            this.props.onSelectFace(i);
        }
    }
    render() {
        const faces = this.props.faces.map((face, i) => {
            const src = face.get('src');
            if (src) {
                return (
                    <FlatButton
                        key={i}
                        style={{ height: null, float: 'left' }}
                        onTouchTap={this.handleTouchTapFace.bind(this, i)}>
                      <Face src={face.get('src')} />
                    </FlatButton>
                );
            } else {
                return <Face key={i} />;
            }
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
        this.z_dim = 20;
        this.state = {
            dialog: Map({
                open: false,
                faces: List()
            }),
            faces: List.of()
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
    selectFace(i) {
        this.setState({
            dialog: this.state.dialog.set('open', false),
            faces: this.state.faces.push(this.state.dialog.get('faces').get(i))
        });
    }
    render() {
        const selectedFaces = this.state.faces.map((face, i) => {
            return <Face key={i} src={face.get('src')} />;
        });
        return (
            <div>
              <h2>Morphing</h2>
              <SelectFaceDialog
                  faces={this.state.dialog.get('faces')}
                  open={this.state.dialog.get('open')}
                  onTouchTapCancelButton={this.handleCancelButton.bind(this)}
                  onSelectFace={this.selectFace.bind(this)} />
              <div>{selectedFaces}</div>
              <FloatingActionButton onTouchTap={this.handleClickAddButton.bind(this)}>
                <ContentAdd />
              </FloatingActionButton>
            </div>
        );
    }
}
