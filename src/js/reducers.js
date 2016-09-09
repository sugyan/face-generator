import { combineReducers } from 'redux';

import { FETCH_OFFSETS } from './actions';

const initalState = {
    offsets: []
};

export default combineReducers({
    offsets: (state = initalState, action) => {
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
