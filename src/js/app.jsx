/* global $, React, ReactDOM */

class Faces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            faces: []
        };
    }
    componentDidMount() {
        for (let i = 0; i < 8; i++) {
            $.ajax({
                url: '/api/generate',
                method: 'POST',
                success: (data) => {
                    const faces = this.state.faces;
                    faces[i] = data.result;
                    this.setState({
                        faces: faces
                    });
                }
            });
        }

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
