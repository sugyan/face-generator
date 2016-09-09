import React from 'react';
import Slider from 'material-ui/Slider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { GridList, GridTile } from 'material-ui/GridList';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { List } from 'immutable';
import 'whatwg-fetch';

import Face from './face.jsx';

export default class Lab extends React.Component {
    constructor(props) {
        super(props);
        const match = new RegExp(`#([0-9a-f]{${this.props.route.z_dim * 2}})`).exec(location.hash);
        this.state = {
            z: match
             ? List(Array.from(Array(props.route.z_dim), (_, i) => parseInt(match[1].substr(i * 2, 2), 16)))
             : List(Array.from(Array(this.props.route.z_dim), () => Math.trunc(Math.random() * 255))),
            face: null
        };
    }
    componentDidMount() {
        this.updateFace();
    }
    calcHex() {
        return this.state.z.map((e) => ('0' + e.toString(16)).slice(-2)).join('');
    }
    updateFace() {
        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.z.map((e) => e / 127.5 - 1.0))
        }).then((response) => {
            return response.json();
        }).then((json) => {
            const url = new URL(location);
            url.hash = this.calcHex();
            history.replaceState(null, null, url.href);
            this.setState({
                face: json.result
            });
        });
    }
    handleChangeSlider(i, e, value) {
        this.setState({
            z: this.state.z.set(i, value)
        }, () => {
            const hex = this.calcHex();
            setTimeout(() => {
                if (hex === this.calcHex()) {
                    this.updateFace();
                }
            }, 200);
        });
    }
    handleClickButton() {
        this.setState({
            z: List(Array.from(Array(this.props.route.z_dim), () => Math.trunc(Math.random() * 255)))
        }, this.updateFace);
    }
    render() {
        const n = this.state.z.size / 2;
        const tiles = [this.state.z.slice(0, n), this.state.z.slice(n)].map((slice, i) => {
            const rows = slice.map((e, j) => {
                return (
                    <TableRow key={j} selectable={false}>
                      <TableRowColumn style={{ width: '100%', paddingRight: 10 }}>
                        <Slider
                            value={e}
                            min={0}
                            max={255}
                            step={1}
                            style={{ width: '100%', height: 40 }}
                            onChange={this.handleChangeSlider.bind(this, i * n + j)} />
                      </TableRowColumn>
                      <TableRowColumn style={{ width: '2em' }}>{e}</TableRowColumn>
                    </TableRow>
                );
            });
            return (
                <GridTile key={i} style={{ border: '1px solid rgb(224, 224, 224)' }}>
                  <Table>
                    <TableBody displayRowCheckbox={false}>
                      {rows}
                    </TableBody>
                  </Table>
                </GridTile>
            );
        });
        return (
            <div>
              <Face src={this.state.face} />
              <GridList
                  cols={2}
                  cellHeight={65 * n + 20}>
                {tiles}
              </GridList>
              <div>
                <TextField
                    ref="textfield"
                    name="url"
                    value={location.href}
                    floatingLabelText="Permalink"
                    underlineShow={false}
                    fullWidth={true}
                    onFocus={() => { this.refs.textfield.select(); }} />
              </div>
              <RaisedButton label="random" primary={true} onTouchTap={this.handleClickButton.bind(this)} />
            </div>
        );
    }
}
