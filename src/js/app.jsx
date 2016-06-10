import React from 'react';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

import Index from './components/index.jsx';
import Morphing from './components/morphing.jsx';

class Common extends React.Component {
    render() {
        return (
            <div>
              <header className="mui-appbar mui--z1">
                <div className="mui-container">
                  <table width="100%">
                    <tbody>
                      <tr className="mui--appbar-height">
                        <td className="mui--text-title">
                          <Link style={{ color: 'white' }} to="/">Face Generator</Link>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <ul className="mui-list--inline mui--text-body2">
                            <li><Link style={{ color: 'white' }} to="/morphing">Morphing</Link></li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
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

export default class App extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
              <Route path="/" component={Common}>
                <IndexRoute component={Index} />
                <Route path="morphing" component={Morphing} />
              </Route>
            </Router>
        );
    }
}
