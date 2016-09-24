import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory, withRouter } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import injectTapEventPlugin from 'react-tap-event-plugin';

import Index from './components/index';
import Morphing from './components/morphing';
import Lab from './components/lab';
import { fetchOffsets, toggleDrawer } from './redux/actions';

injectTapEventPlugin();

class Common extends Component {
    handleMenuTouchTap(path) {
        this.props.dispatch(toggleDrawer());
        this.props.router.push(path);
    }
    componentDidMount() {
        fetch('/api/offsets').then((response) => {
            return response.json();
        }).then((json) => {
            this.props.dispatch(fetchOffsets(json.offsets));
        });
    }
    render() {
        return (
            <div>
              <AppBar
                  title={<span style={{ cursor: 'pointer' }}>Face Generator</span>}
                  onTitleTouchTap={() => this.props.router.push('/')}
                  onLeftIconButtonTouchTap={() => this.props.dispatch(toggleDrawer())} />
              <div style={{ margin: '24px 36px' }}>
                {this.props.children}
              </div>
              <Drawer open={this.props.common.drawer}>
                <AppBar
                    title="Menu"
                    onLeftIconButtonTouchTap={() => this.props.dispatch(toggleDrawer())} />
                <MenuItem onTouchTap={this.handleMenuTouchTap.bind(this, 'lab')}>Lab</MenuItem>
              </Drawer>
            </div>
        );
    }
}

export default class App extends Component {
    constructor() {
        super();
        this.z_dim = 16;
    }
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
              <Router history={browserHistory}>
                <Route path="/" component={connect((state) => ({ common: state.common }))(withRouter(Common))}>
                  <IndexRoute component={Index} z_dim={this.z_dim} />
                  <Route path="morphing" component={Morphing} z_dim={this.z_dim} />
                  <Route path="lab" components={Lab} z_dim={this.z_dim} />
                </Route>
              </Router>
            </MuiThemeProvider>
        );
    }
}
