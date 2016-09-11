import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import 'whatwg-fetch';

import Sliders from './lab/sliders.jsx';
import Face from './face.jsx';
import { labUpdateZ, labUpdateFace } from '../actions';

class Lab extends Component {
    constructor(props) {
        super(props);
        const match = new RegExp(`#([0-9a-f]{${this.props.route.z_dim * 2}})`).exec(location.hash);
        const z = match
                ? Array.from(Array(props.route.z_dim), (_, i) => parseInt(match[1].substr(i * 2, 2), 16))
                : Array.from(Array(this.props.route.z_dim), () => Math.trunc(Math.random() * 255));
        this.props.dispatch(labUpdateZ(z));
        this.props.updateFace(z);
    }
    /* componentDidMount() {
     *     this.updateFace();
     * }
     * calcHex() {
     *     return this.state.z.map((e) => ('0' + e.toString(16)).slice(-2)).join('');
     * }
     * updateFace() {
     * }
     * }*/
    handleClickButton() {
        const z = Array.from(Array(this.props.route.z_dim), () => Math.trunc(Math.random() * 255));
        this.props.dispatch(labUpdateZ(z));
        this.props.updateFace(z);
    }
    render() {
        return (
            <div>
              <Face src={this.props.lab.face} />
              <Sliders z_dim={this.props.route.z_dim} />
              {/*
                  <div>
                  <TextField
                  ref="textfield"
                  name="url"
                  value={location.href}
                  floatingLabelText="Permalink"
                  underlineShow={false}
                  fullWidth={true}
                  onFocus={() => { this.refs.textfield.select(); }} /> */}
              <div>
                <TextField
                    name="url"/>
              </div>
              <RaisedButton label="random" primary={true} onTouchTap={this.handleClickButton.bind(this)} />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        global: state.global,
        lab: state.lab
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        updateFace: (z) => {
            fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(z.map((e) => e / 127.5 - 1.0))
            }).then((response) => {
                return response.json();
            }).then((json) => {
                dispatch(labUpdateFace(json.result));
                /* const url = new URL(location);
                 * url.hash = this.calcHex();
                 * history.replaceState(null, null, url.href);
                 */
            });
        },
        dispatch
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Lab);
