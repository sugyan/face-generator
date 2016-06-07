/* global $, React, ReactDOM, ReactRouter */

class Morphing extends React.Component {
    constructor(props) {
        super(props);
        this.z_dim = 40;
        this.rows = 5;
        this.cols = 8;
        this.z = Array.from(Array(this.z_dim)).map(() => Math.random() * 2 - 1);
        this.state = {
            faces: Array.from(Array(this.rows)).map(() => Array.from(Array(this.cols)))
        };
    }
    componentDidMount() {
        this.runMorphing();
    }
    runMorphing() {
        $.ajax({
            url: '/api/generate',
            method: 'POST',
            data: JSON.stringify(this.z),
            contentType: 'application/json',
            success: (data) => {
                const faces = this.state.faces;
                faces.forEach((row, i) => {
                    row.forEach((_, j) => {
                        faces[i][j] = undefined;
                    });
                });
                this.setState({
                    base: data.result,
                    faces: faces
                });
                this.generateFaces(this.z);
            }
        });
    }
    generateFaces(z0) {
        this.state.faces.forEach((row, i) => {
            const d = [];
            let scale = Infinity;
            for (let j = 0; j < this.z_dim; j++) {
                const z1 = Math.random() * 2 - 1;
                d[j] = z1 - z0[j];
                scale = Math.min(scale, 1.0 + ((d[j] > 0.0 ? 1.0 : -1.0) - z1) / d[j]);
            }
            row.forEach((_, j) => {
                const z = Array.from(Array(this.z_dim)).map((_, k) => {
                    return z0[k] + (j + 1) / this.cols * d[k] * scale;
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
    selectBaseFace(face) {
        this.z = face.props.z;
        this.runMorphing();
    }
    render() {
        const base = <Face src={this.state.base} z={this.z} handleClick={this.selectBaseFace.bind(this)} />;
        return (
            <div>
              <h2>Morphing</h2>
              {base}
              <MorphingFaces faces={this.state.faces} handleSelectBaseFace={this.selectBaseFace.bind(this)} />
            </div>
        );
    }
}

class MorphingFaces extends React.Component {
    render() {
        const faces = this.props.faces.map((row) => {
            const cols = row.map((data) => {
                let src, z;
                if (data) {
                    [src, z] = data;
                }
                return <Face src={src} z={z} handleClick={this.props.handleSelectBaseFace} />;
            });
            return <div>{cols}</div>;
        });
        return <div>{faces}</div>;
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
                <div>{cols}</div>
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
