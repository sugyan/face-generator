import React from 'react';
import Slider from 'material-ui/Slider';
import RaisedButton from 'material-ui/RaisedButton';
import { GridList, GridTile } from 'material-ui/GridList';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

import { List } from 'immutable';

import Face from './face.jsx';

export default class Lab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            z: List(Array.from(Array(this.props.route.z_dim), () => Math.trunc(Math.random() * 255))),
            face: null
        };
    }
    componentDidMount() {
        this.updateFace();
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
            this.setState({
                face: json.result
            });
        });
    }
    handleChangeSlider(i, e, value) {
        this.setState({
            z: this.state.z.set(i, value)
        }, this.updateFace);
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
                      <TableRowColumn style={{ width: '100%' }}>
                        <Slider
                            value={e}
                            min={0}
                            max={255}
                            step={1}
                            style={{ height: 40, width: '100%' }}
                            onChange={this.handleChangeSlider.bind(this, i * n + j)} />
                      </TableRowColumn>
                      <TableRowColumn style={{ width: '2em' }}>
                        {e}
                      </TableRowColumn>
                    </TableRow>
                );
            });
            return (
                <GridTile key={i}>
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
              <hr />
              <GridList
                  cols={2}
                  cellHeight={65 * n + 20}>
                {tiles}
              </GridList>
              <RaisedButton label="random" primary={true} onTouchTap={this.handleClickButton.bind(this)} />
            </div>
        );
    }
}
