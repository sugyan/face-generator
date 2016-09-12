import { combineReducers } from 'redux';

import {
    FETCH_OFFSETS, TOGGLE_DRAWER,
    LAB_UPDATE_Z, LAB_UPDATE_FACE
} from './actions';

export default combineReducers({
    global: (state = {
        offsets: []
    }, action) => {
        switch (action.type) {
        case FETCH_OFFSETS:
            return Object.assign({}, state, {
                offsets: action.offsets
            });
        default:
            return state;
        }
    },
    common: (state = {
        drawer: false
    }, action) => {
        switch (action.type) {
        case TOGGLE_DRAWER:
            return Object.assign({}, state, {
                drawer: !state.drawer
            });
        default:
            return state;
        }
    },
    lab: (state = {
        face: null,
        z: [],
        href: ''
    }, action) => {
        switch (action.type) {
        case LAB_UPDATE_Z:
            return Object.assign({}, state, {
                z: action.z
            });
        case LAB_UPDATE_FACE:
            return Object.assign({}, state, {
                face: action.src,
                href: action.href
            });
        default:
            return state;
        }
    }
});
