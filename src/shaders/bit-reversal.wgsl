// ============================================================================
// REFERENCE COPY - DO NOT EDIT
// This file is a reference copy only. The canonical source is in sources.ts.
// Edit src/shaders/sources.ts and run build to update this file if needed.
// ============================================================================

// Bit-reversal permutation shader for FFT

// Compute bit-reversed index
fn bit_reverse(x: u32, bits: u32) -> u32 {
    var result: u32 = 0u;
    var val: u32 = x;
    for (var i: u32 = 0u; i < bits; i = i + 1u) {
        result = (result << 1u) | (val & 1u);
        val = val >> 1u;
    }
    return result;
}

// Uniforms
struct BitReversalParams {
    n: u32,      // Array size
    bits: u32,   // log2(n)
}

@group(0) @binding(0) var<uniform> params: BitReversalParams;
@group(0) @binding(1) var<storage, read> input: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> output: array<vec2<f32>>;

@compute @workgroup_size(256)
fn bit_reversal_permutation(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let i = global_id.x;
    if (i >= params.n) {
        return;
    }
    
    let j = bit_reverse(i, params.bits);
    
    // Copy element from input[i] to output[j]
    // Each thread handles one element, writing to its bit-reversed position
    output[j] = input[i];
}

// In-place bit-reversal (requires two passes or careful synchronization)
// This version uses a ping-pong buffer approach for simplicity
