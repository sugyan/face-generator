import React from 'react';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import injectTapEventPlugin from 'react-tap-event-plugin';

import Index from './components/index.jsx';
import Morphing from './components/morphing.jsx';
import Lab from './components/lab.jsx';

injectTapEventPlugin();

class Common extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawer: false
        };
    }
    render() {
        return (
            <div>
              <AppBar
                  title="Face Generator"
                  onTitleTouchTap={() => { /* TODO */ }}
                  onLeftIconButtonTouchTap={() => this.setState({ drawer: true })} />
              <div style={{ margin: '24px 36px' }}>
                {this.props.children}
              </div>
              <Drawer open={this.state.drawer}>
                <AppBar onLeftIconButtonTouchTap={() => this.setState({ drawer: false })} />
                <MenuItem><Link to="lab">Lab</Link></MenuItem>
              </Drawer>
            </div>
        );
    }
}

export default class App extends React.Component {
    constructor() {
        super();
        this.z_dim = 16;
    }
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
              <Router history={browserHistory}>
                <Route path="/" component={Common}>
                  <IndexRoute component={Index} z_dim={this.z_dim} />
                  <Route path="morphing" component={Morphing} z_dim={this.z_dim} />
                  <Route path="lab" components={Lab} z_dim={this.z_dim} />
                </Route>
              </Router>
            </MuiThemeProvider>
        );
    }
}
