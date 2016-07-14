import React from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import 'whatwg-fetch';

export default class Face extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            src: props.src
        };
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
    handleTouchTap() {
        this.props.onTouchTap(this);
    }
    render() {
        return (
            <FlatButton
                style={{ height: undefined }}
                disabled={(this.props.onTouchTap === undefined) || !this.state.src}
                onTouchTap={this.handleTouchTap.bind(this)}>
              <Paper zDepth={2} style={{ float: 'left', height: 96, width: 96, margin: 5 }}>
                {this.state.src
                 ? <img src={this.state.src} />
                 : <CircularProgress size={1.92 / 1.4} />}
              </Paper>
            </FlatButton>
        );
    }
}
