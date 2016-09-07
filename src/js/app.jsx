import React from 'react';
import { Router, Route, IndexRoute, browserHistory, withRouter } from 'react-router';
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
    handleMenuTouchTap(path) {
        this.setState({
            drawer: false
        });
        this.props.router.push(path);
    }
    render() {
        return (
            <div>
              <AppBar
                  title="Face Generator"
                  onTitleTouchTap={() => this.props.router.push('/')}
                  onLeftIconButtonTouchTap={() => this.setState({ drawer: true })} />
              <div style={{ margin: '24px 36px' }}>
                {this.props.children}
              </div>
              <Drawer open={this.state.drawer}>
                <AppBar
                    title="Menu"
                    onLeftIconButtonTouchTap={() => this.setState({ drawer: false })} />
                <MenuItem onTouchTap={this.handleMenuTouchTap.bind(this, 'lab')}>Lab</MenuItem>
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
                <Route path="/" component={withRouter(Common)}>
                  <IndexRoute component={Index} z_dim={this.z_dim} />
                  <Route path="morphing" component={Morphing} z_dim={this.z_dim} />
                  <Route path="lab" components={Lab} z_dim={this.z_dim} />
                </Route>
              </Router>
            </MuiThemeProvider>
        );
    }
}
