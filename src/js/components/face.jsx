import React from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
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
            this.setState({ src: json.result });
        });
    }
    render() {
        const indicator_style = {
            display: 'inline-block',
            position: 'relative',
            verticalAlign: 'top'
        };
        return (
            this.state.src
            ? <img src={this.state.src} />
            : <RefreshIndicator left={0} top={0} size={96} status="loading" style={indicator_style} />
        );
    }
}
