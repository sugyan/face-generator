export const FETCH_OFFSETS = 'FETCH_OFFSETS';

export const fetchOffsets = (offsets) => {
    return { type: FETCH_OFFSETS, offsets };
};
