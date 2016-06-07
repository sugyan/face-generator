/* global $, React, ReactDOM, ReactRouter */

class Morphing extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.state = {
            z: Array.from(Array(this.z_dim)).map(() => Math.random() * 2 - 1),
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
    updateBaseFace(z) {
        this.setState({ z: z });
    }
    handleSelectBaseFace(face) {
        this.updateBaseFace(face.props.z);
    }
    render() {
        let faces = null;
        if (this.state.face) {
            faces = <MorphingFaces z={this.state.z} z_dim={this.z_dim} handleSelectBaseFace={this.handleSelectBaseFace.bind(this)} />;
        }
        return (
            <div>
              <h2>Morphing</h2>
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
            faces: Array.from(Array(this.rows)).map(() => Array.from(Array(this.cols), () => []))
        };
    }
    componentDidMount() {
        this.state.faces.forEach((row, i) => {
            const z1 = [];
            const d = [];
            let scale = Infinity;
            for (let j = 0; j < this.props.z_dim; j++) {
                z1[j] = Math.random() * 2 - 1;
                d[j] = z1[j] - this.props.z[j];
                scale = Math.min(scale, 1.0 + ((d[j] > 0.0 ? 1.0 : -1.0) - z1[j]) / d[j]);
            }
            row.forEach((col, j) => {
                const z = Array.from(Array(this.props.z_dim)).map((_, k) => {
                    return this.props.z[k] + (j + 1) / this.cols * d[k] * scale;
                });
                $.ajax({
                    url: '/api/generate',
                    method: 'POST',
                    data: JSON.stringify(z),
                    contentType: 'application/json',
                    success: (data) => {
                        const faces = this.state.faces;
                        faces[i][j] = [data.result, z];
                        this.setState({ faces: faces });
                    }
                });
            });
        });
    }
    render() {
        const faces = this.state.faces.map((row) => {
            const cols = row.map((e) => {
                return <Face src={e[0]} z={e[1]} handleClick={this.props.handleSelectBaseFace} />;
            });
            return <div>{cols}</div>;
        });
        return (
            <div>{faces}</div>
        );
    }
}

class Average extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
    }
    render() {
        return (
            <div>
              <h2>Average</h2>
              <AverageRandomGenerator rows={5} cols={5} z_dim={this.z_dim} />
            </div>
        );
    }
}

class AverageRandomGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            faces: Array.from(Array(this.props.rows)).map(() => Array.from(Array(this.props.cols)))
        };
    }
    componentDidMount() {
        this.generateFaces();
    }
    generateFaces() {
        this.setState({ faces: Array.from(Array(this.props.rows)).map(() => Array.from(Array(this.props.cols))) });
        this.state.faces.forEach((row, i) => {
            row.forEach((col, j) => {
                const z = Array.from(Array(this.props.z_dim)).map(() => Math.random() * 2 - 1);
                $.ajax({
                    url: '/api/generate',
                    method: 'POST',
                    data: JSON.stringify(z),
                    contentType: 'application/json',
                    success: (data) => {
                        const faces = this.state.faces;
                        faces[i][j] = data.result;
                        this.setState({ faces: faces });
                    }
                });
            });
        });
    }
    handleClickButton() {
        this.generateFaces();
    }
    render() {
        const images = this.state.faces.map((row) => {
            const cols = row.map((e) => {
                return <Face src={e} />;
            });
            return (
                <div style={{ lineHeight: 0 }}>{cols}</div>
            );
        });
        return (
            <div>
              {images}
              <button onClick={this.handleClickButton.bind(this)}>Generate</button>
            </div>
        );
    }
}

class Face extends React.Component {
    handleClick() {
        if (this.props.handleClick) {
            this.props.handleClick(this);
        }
    }
    render() {
        const style = {
            backgroundColor: 'black'
        };
        if (this.props.handleClick) {
            style.cursor = 'pointer';
        }
        return (
            <img
                onClick={this.handleClick.bind(this)}
                src={this.props.src || '/static/img/loading.gif'}
                style={style}
            />
        );
    }
}

class App extends React.Component {
    render() {
        const Link = ReactRouter.Link;
        return (
            <div>
              <header className="mui-appbar mui--z1">
                <div className="mui-container">
                  <table width="100%">
                    <tr className="mui--appbar-height">
                      <td className="mui--text-title">
                        <Link style={{ color: 'white' }} to="/">Face Generator</Link>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ul className="mui-list--inline mui--text-body2">
                          <li><Link style={{ color: 'white' }} to="/morphing">Morphing</Link></li>
                          <li><Link style={{ color: 'white' }} to="/average">Average</Link></li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                </div>
              </header>
              <div className="mui-container">
                {this.props.children}
              </div>
            </div>
        );
    }
}

class Index extends React.Component {
    render() {
        return (
            <div></div>
        );
    }
}

$(() => {
    const Router = ReactRouter.Router;
    const Route = ReactRouter.Route;
    const IndexRoute = ReactRouter.IndexRoute;
    ReactDOM.render(
        <Router history={ReactRouter.browserHistory}>
          <Route path="/" component={App}>
            <IndexRoute component={Index} />
            <Route path="morphing" component={Morphing} />
            <Route path="average" component={Average} />
          </Route>
        </Router>,
        document.getElementById('body')
    );
});
