import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import injectTapEventPlugin from 'react-tap-event-plugin';

import Index from './components/index.jsx';
import Morphing from './components/morphing.jsx';

injectTapEventPlugin();

class Common extends React.Component {
    render() {
        return (
            <div>
              <AppBar
                  title="Face Generator"
                  showMenuIconButton={false}>
              </AppBar>
              <div style={{ margin: '24px 36px' }}>
                {this.props.children}
              </div>
            </div>
        );
    }
}

export default class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
              <Router history={hashHistory}>
                <Route path="/" component={Common}>
                  <IndexRoute component={Index} />
                  <Route path="morphing" component={Morphing} />
                </Route>
              </Router>
            </MuiThemeProvider>
        );
    }
}
