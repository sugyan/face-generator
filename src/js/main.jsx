import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import App from './app.jsx';
import reducers from './reducers';

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={createStore(reducers)}>
          <App />
        </Provider>,
        document.getElementById('main')
    );
});
