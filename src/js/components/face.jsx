import React from 'react';

export default class Face extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            src: '/static/img/loading.gif'
        };
    }
    componentDidMount() {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/generate');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                const data = JSON.parse(xhr.responseText);
                this.setState({
                    src: data.result
                });
            }
        };
        xhr.send(JSON.stringify(this.props.z));
    }
    render() {
        return <img src={this.state.src} style={{ backgroundColor: 'black' }} />;
    }
}
