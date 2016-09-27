export const FETCH_OFFSETS    = 'FETCH_OFFSETS';
export const TOGGLE_DRAWER    = 'TOGGLE_DRAWER';
export const INDEX_ADD_FACE   = 'INDEX_ADD_FACE';
export const LAB_UPDATE_Z     = 'LAB_UPDATE_Z';
export const LAB_UPDATE_FACE  = 'LAB_UPDATE_FACE';
export const LAB_TOGGLE_CHECK = 'LAB_TOGGLE_CHECK';

export const fetchOffsets = (offsets) => {
    return { type: FETCH_OFFSETS, offsets };
};

export const toggleDrawer = () => {
    return { type: TOGGLE_DRAWER };
};

export const indexAddFace = () => {
    return { type: INDEX_ADD_FACE };
};

export const labUpdateZ = (z) => {
    return { type: LAB_UPDATE_Z, z };
};

export const labUpdateFace = (src, href) => {
    return { type: LAB_UPDATE_FACE, src, href };
};

export const labToggleCheck = () => {
    return { type: LAB_TOGGLE_CHECK };
};
