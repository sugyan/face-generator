import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import 'whatwg-fetch';

import Face from './face';
import { indexAddFace, indexUpdateFace, indexClearFaces } from '../redux/actions';

class Index extends Component {
    generate() {
        const z = Array.from(Array(this.props.route.z_dim), () => Math.random() * 2 - 1);
        const offsets = this.props.global.offsets.filter((o) => {
            return o.name === 'default';
        })[0];
        if (offsets) {
            offsets.values.forEach((value, i) => {
                const range = [-1, 1];
                range[value > 0.0 ? 1 : 0] -= value;
                z[i] = value + range[0] + Math.random() * (range[1] - range[0]);
            });
        }
        const i = this.props.index.faces.size;
        this.props.dispatch(indexAddFace(z));
        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(z)
        }).then((response) => {
            return response.json();
        }).then((json) => {
            this.props.dispatch(indexUpdateFace(i, json.result));
        });
    }
    render() {
        const faces = this.props.index.faces.map((face, i) => {
            return (
                <div key={i} style={{ float: 'left' }}>
                  <Face src={face.get('src')} />
                </div>
            );
        });
        return (
            <div>
              <h2>Generator</h2>
              <div>
                <RaisedButton onTouchTap={this.generate.bind(this)} primary={true}>
                  generate
                </RaisedButton>
                <RaisedButton onTouchTap={() => this.props.dispatch(indexClearFaces())}>
                  clear
                </RaisedButton>
              </div>
              <br />
              <div>{faces}</div>
            </div>
        );
    }
}
export default connect(
    (state) => {
        return {
            global: state.global,
            index: state.index
        };
    }
)(Index);
