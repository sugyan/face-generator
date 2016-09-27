import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import { List, Map } from 'immutable';
import 'whatwg-fetch';

import Face from './face';
import { indexAddFace } from '../redux/actions';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            faces: List()
        };
    }
    generate() {
        const z = Array.from(Array(this.props.route.z_dim), () => Math.random() * 2 - 1);
        const i = this.state.faces.size;
        this.props.dispatch(indexAddFace());
        this.setState({
            faces: this.state.faces.push(Map({ z: z }))
        });
        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(z)
        }).then((response) => {
            return response.json();
        }).then((json) => {
            this.setState({
                faces: this.state.faces.updateIn([i], (face) => {
                    return face.set('src', json.result);
                })
            });
        });
    }
    clear() {
        this.setState({
            faces: List()
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
                <RaisedButton onTouchTap={this.clear.bind(this)}>
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
