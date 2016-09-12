import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GridList, GridTile } from 'material-ui/GridList';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import Slider from 'material-ui/Slider';

import { labUpdateZ } from '../../actions';

class Sliders extends Component {
    handleChangeSlider(i, e, value) {
        const z = this.props.lab.z;
        z[i] = value;
        this.props.dispatch(labUpdateZ(z));

        const key = z.join('-');
        setTimeout(() => {
            if (key === z.join('-')) {
                this.props.updateFace(z);
            }
        }, 200);
    }
    render() {
        const n = this.props.z_dim / 2;
        const tiles = [this.props.lab.z.slice(0, n), this.props.lab.z.slice(n)].map((slice, i) => {
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
            <GridList
                cols={2}
                cellHeight={65 * n + 20}>
              {tiles}
            </GridList>
        );
    }
}
export default connect((state) => ({ lab: state.lab }))(Sliders);
