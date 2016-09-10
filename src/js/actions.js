export const FETCH_OFFSETS = 'FETCH_OFFSETS';
export const TOGGLE_DRAWER = 'TOGGLE_DRAWER';

export const fetchOffsets = (offsets) => {
    return { type: FETCH_OFFSETS, offsets };
};

export const toggleDrawer = () => {
    return { type: TOGGLE_DRAWER };
};
