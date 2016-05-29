/* global $, React, ReactDOM */

class Faces extends React.Component {
    constructor(props) {
        super(props);
        this.rows = 3;
        this.cols = 8;
        this.state = {
            faces: [...Array(this.rows)].map(() => [...Array(this.cols)])
        };
    }
    componentDidMount() {
        const z_dim = 40;
        const z0 = [...Array(z_dim)].map(() => Math.random() * 2 - 1);

        for (let i = 0; i < this.rows; i++) {
            const z1 = [];
            const d = [];
            let scale = Infinity;
            for (let j = 0; j < z_dim; j++) {
                z1[j] = Math.random() * 2 - 1;
                d[j] = z1[j] - z0[j];
                scale = Math.min(scale, 1.0 + ((d[j] > 0.0 ? 1.0 : -1.0) - z1[j]) / d[j]);
            }
            const zs = [];
            for (let j = 0; j < this.cols; j++) {
                const z = [];
                for (let k = 0; k < z_dim; k++) {
                    z[k] = z0[k] + (j + 1) / this.cols * d[k] * scale;
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
                        this.setState({
                            faces: faces
                        });
                    }
                });
            });
        }
    }
    render() {
        const faces = this.state.faces.map((row, i) => {
            return (
                <div>{row.map((e, j) => <img key={`${i}:${j}`} src={e} />)}</div>
            );
        });
        return (
            <div>{faces}</div>
        );
    }
}

$(() => {
    ReactDOM.render(
        <Faces />,
        document.getElementById('main')
    );
});
