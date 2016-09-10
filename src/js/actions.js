export const FETCH_OFFSETS   = 'FETCH_OFFSETS';
export const TOGGLE_DRAWER   = 'TOGGLE_DRAWER';
export const LAB_UPDATE_Z    = 'LAB_UPDATE_Z';
export const LAB_UPDATE_FACE = 'LAB_UPDATE_FACE';

export const fetchOffsets = (offsets) => {
    return { type: FETCH_OFFSETS, offsets };
};

export const toggleDrawer = () => {
    return { type: TOGGLE_DRAWER };
};

export const labUpdateZ = (z) => {
    return { type: LAB_UPDATE_Z, z };
};

export const labUpdateFace = (src) => {
    return { type: LAB_UPDATE_FACE, src };
};
