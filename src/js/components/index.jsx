import React from 'react';
import Button from 'muicss/lib/react/button';

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
                <Button onClick={this.generate.bind(this)} color="primary">
                  generate
                </Button>
                <Button onClick={this.clear.bind(this)}>
                  clear
                </Button>
              </div>
              <div>{faces}</div>
            </div>
        );
    }
}
