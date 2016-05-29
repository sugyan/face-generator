/* global $, React, ReactDOM */

class Morphing extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.state = {
            z: [...Array(this.z_dim)].map(() => Math.random() * 2 - 1),
            face: null
        };
    }
    componentDidMount() {
        $.ajax({
            url: '/api/generate',
            method: 'POST',
            data: JSON.stringify(this.state.z),
            contentType: 'application/json',
            success: (data) => {
                this.setState({ face: data.result });
            }
        });
    }
    render() {
        let faces = null;
        if (this.state.face) {
            faces = <MorphingFaces z={this.state.z} z_dim={this.z_dim} />;
        }
        return (
            <div>
              <Face src={this.state.face} />
              {faces}
            </div>
        );
    }
}

class MorphingFaces extends React.Component {
    constructor(props) {
        super(props);
        this.rows = 5;
        this.cols = 8;
        this.state = {
            faces: [...Array(this.rows)].map(() => [...Array(this.cols)])
        };
    }
    componentDidMount() {
        for (let i = 0; i < this.rows; i++) {
            const z1 = [];
            const d = [];
            let scale = Infinity;
            for (let j = 0; j < this.props.z_dim; j++) {
                z1[j] = Math.random() * 2 - 1;
                d[j] = z1[j] - this.props.z[j];
                scale = Math.min(scale, 1.0 + ((d[j] > 0.0 ? 1.0 : -1.0) - z1[j]) / d[j]);
            }
            const zs = [];
            for (let j = 0; j < this.cols; j++) {
                const z = [];
                for (let k = 0; k < this.props.z_dim; k++) {
                    z[k] = this.props.z[k] + (j + 1) / this.cols * d[k] * scale;
                }
                zs.push(z);
            }
            zs.forEach((e, j) => {
                $.ajax({
                    url: '/api/generate',
                    method: 'POST',
                    data: JSON.stringify(e),
                    contentType: 'application/json',
                    success: (data) => {
                        const faces = this.state.faces;
                        faces[i][j] = data.result;
                        this.setState({ faces: faces });
                    }
                });
            });
        }
    }
    render() {
        const faces = this.state.faces.map((row, i) => {
            return (
                <div>{row.map((e, j) => <Face key={`${i}:${j}`} src={e} />)}</div>
            );
        });
        return (
            <div>{faces}</div>
        );
    }
}

class Face extends React.Component {
    render() {
        return (
            <img
                src={this.props.src || '/static/img/loading.gif'}
                style={{ backgroundColor: 'black' }}
            />
        );
    }
}

$(() => {
    ReactDOM.render(
        <Morphing />,
        document.getElementById('main')
    );
});
