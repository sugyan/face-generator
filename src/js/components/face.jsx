import React from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import 'whatwg-fetch';

export default class Face extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.props.z)
        }).then((response) => {
            return response.json();
        }).then((json) => {
            window.setTimeout(() => {
                this.setState({ src: json.result });
            }, 750);
        });
    }
    render() {
        return (
            <Paper zDepth={2} style={{ float: 'left', height: 96, width: 96, margin: 5 }}>
              {this.state.src
              ? <img src={this.state.src} />
              : <CircularProgress size={1.92 / 1.4} />}
            </Paper>
        );
    }
}
