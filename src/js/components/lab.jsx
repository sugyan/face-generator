import React from 'react';
import Slider from 'material-ui/Slider';

import Face from './face.jsx';

export default class Lab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            z: Array.from(Array(this.props.route.z_dim), () => Math.random() * 2 - 1)
        };
    }
    render() {
        const sliders = this.state.z.map((e, i) => {
            return (
                <div key={i} style={{ float: 'left' }}>
                  <Slider defaultValue={e} min={-1.0} max={1.0} axis={'y'} style={{ height: 200, width: 50 }} />
                </div>
            );
        });
        return (
            <div>
              <div>
                <Face />
              </div>
              {sliders}
            </div>
        );
    }
}
