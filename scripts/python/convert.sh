#!/usr/bin/env bash
set -e

INPUT_PATH=$1
OUTPUT_PATH=$2

if [ -z "${INPUT_PATH}" ] || [ -z "${OUTPUT_PATH}" ]; then
    echo "Usage: $(basename $0) input_path output_path"
    exit 1
fi

set -x

tensorflowjs_converter \
    --control_flow_v2=True \
    --input_format=tf_saved_model \
    --quantize_uint8=* \
    --saved_model_tags=serve \
    --signature_name=serving_default \
    --strip_debug_ops=True \
    --weight_shard_size_bytes=4194304 \
    "${INPUT_PATH}" "${OUTPUT_PATH}"
