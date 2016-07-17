import React from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';

export default class Face extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Paper zDepth={2} style={{ float: 'left', height: 96, width: 96, margin: 5 }}>
              {this.props.src
               ? <img src={this.props.src} />
               : <CircularProgress size={1.92 / 1.4} />}
            </Paper>
        );
    }
}
