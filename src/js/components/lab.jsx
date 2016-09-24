import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import 'whatwg-fetch';

import Sliders from './lab/sliders';
import Face from './face';
import { labUpdateZ, labUpdateFace, labToggleCheck } from '../redux/actions';

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
    handleClickButton() {
        const z = Array.from(Array(this.props.route.z_dim), () => Math.trunc(Math.random() * 255));
        if (this.props.lab.checked) {
            const offsets = this.props.global.offsets.filter((o) => {
                return o.name === 'default';
            })[0];
            offsets.values.forEach((e, i) => {
                const range = [-1, 1];
                range[e > 0.0 ? 1 : 0] -= e;
                const val = e + range[0] + Math.random() * (range[1] - range[0]);
                z[i] = Math.floor((val + 1.0) / 2.0 * 255);
            });
        }
        this.props.dispatch(labUpdateZ(z));
        this.props.updateFace(z);
    }
    componentDidMount() {
        this.props.dispatch(labUpdateFace(null, location.href));
    }
    render() {
        return (
            <div>
              <Face src={this.props.lab.face} />
              <Sliders z_dim={this.props.route.z_dim} updateFace={this.props.updateFace} />
              <div>
                <TextField
                    ref="textfield"
                    name="url"
                    value={this.props.lab.href}
                    floatingLabelText="Permalink"
                    underlineShow={true}
                    fullWidth={true}
                    inputStyle={{ fontFamily: 'monospace' }}
                    onFocus={() => { this.refs.textfield.select(); }} />
              </div>
              <RaisedButton label="random" primary={true} onTouchTap={this.handleClickButton.bind(this)} />
              <Checkbox
                  checked={this.props.lab.checked}
                  label="add offsets"
                  style={{ marginTop: 10 }}
                  onCheck={() => this.props.dispatch(labToggleCheck())}/>
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
                const url = new URL(location);
                url.hash = z.map((e) => ('0' + e.toString(16)).slice(-2)).join('');
                history.replaceState(null, null, url.href);

                dispatch(labUpdateFace(json.result, url.href));
            });
        },
        dispatch
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Lab);
