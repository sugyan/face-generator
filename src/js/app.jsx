/* global $, React, ReactDOM */

class Faces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            faces: []
        };
    }
    componentDidMount() {
        const z_dim = 40;
        const cols = 10;

        const z0 = [];
        const z1 = [];
        const d = [];
        for (let i = 0; i < z_dim; i++) {
            z0[i] = Math.random() * 2 - 1;
            z1[i] = Math.random() * 2 - 1;
            d[i] = z1[i] - z0[i];
        }
        const zs = [];
        for (let i = 0; i <= cols; i++) {
            const z = [];
            for (let j = 0; j < z_dim; j++) {
                z[j] = z0[j] + i / cols * d[j];
            }
            zs.push(z);
        }
        zs.forEach((e, i) => {
            $.ajax({
                url: '/api/generate',
                method: 'POST',
                data: JSON.stringify(e),
                contentType: 'application/json',
                success: (data) => {
                    const faces = this.state.faces;
                    faces[i] = data.result;
                    this.setState({
                        faces: faces
                    });
                }
            });
        });
    }
    render() {
        const faces = this.state.faces.map((e, i) => {
            return <img key={i} src={e} />;
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
