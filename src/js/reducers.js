import { combineReducers } from 'redux';

import { FETCH_OFFSETS, TOGGLE_DRAWER } from './actions';

export default combineReducers({
    common: (state = { drawer: false }, action) => {
        switch (action.type) {
        case TOGGLE_DRAWER:
            return Object.assign({}, state, {
                drawer: !state.drawer
            });
        default:
            return state;
        }
    },
    global: (state = { offsets: [] }, action) => {
        switch (action.type) {
        case FETCH_OFFSETS:
            return Object.assign({}, state, {
                offsets: action.offsets
            });
        default:
            return state;
        }
    }
});
