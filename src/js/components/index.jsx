import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

import Face from './face.jsx';

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.state = {
            faces: []
        };
    }
    generate() {
        const z = Array.from(Array(this.z_dim), () => Math.random() * 2 - 1);
        const faces = this.state.faces;
        faces.push(z);
        this.setState({
            faces: faces
        });
    }
    clear() {
        this.setState({
            faces: []
        });
    }
    render() {
        const faces = this.state.faces.map((z, i) => {
            return <Face key={`${i}`} z={z} />;
        });
        return (
            <div>
              <h2>Generator</h2>
              <div>
                <RaisedButton onClick={this.generate.bind(this)} primary={true}>
                  generate
                </RaisedButton>
                <RaisedButton onClick={this.clear.bind(this)}>
                  clear
                </RaisedButton>
              </div>
              <div>{faces}</div>
            </div>
        );
    }
}
