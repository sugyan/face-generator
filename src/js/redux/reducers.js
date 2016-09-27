import { combineReducers } from 'redux';
import { List, Map } from 'immutable';

import {
    FETCH_OFFSETS, TOGGLE_DRAWER,
    INDEX_ADD_FACE, INDEX_UPDATE_FACE, INDEX_CLEAR_FACES,
    LAB_UPDATE_Z, LAB_UPDATE_FACE, LAB_TOGGLE_CHECK
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
    index: (state = {
        faces: List()
    }, action) => {
        switch (action.type) {
        case INDEX_ADD_FACE:
            return Object.assign({}, state, {
                faces: state.faces.push(Map({ z: action.z }))
            });
        case INDEX_UPDATE_FACE:
            return Object.assign({}, state, {
                faces: state.faces.updateIn([action.i], (e) => e.set('src', action.src))
            });
        case INDEX_CLEAR_FACES:
            return Object.assign({}, state, {
                faces: List()
            });
        default:
            return state;
        }
    },
    lab: (state = {
        face: null,
        z: [],
        href: '',
        checked: false
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
        case LAB_TOGGLE_CHECK:
            return Object.assign({}, state, {
                checked: !state.checked
            });
        default:
            return state;
        }
    }
});
