// Centralized shader source strings for WebGPU compute pipelines.
// Canonical source of truth — standalone .wgsl files are kept as reference.

export const COMPLEX_OPS = `
const PI: f32 = 3.14159265358979323846;

fn complex_add(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x + b.x, a.y + b.y);
}

fn complex_sub(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x - b.x, a.y - b.y);
}

fn complex_mul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

fn twiddle_factor(k: u32, N: u32, inverse: bool) -> vec2<f32> {
    var angle: f32;
    if (inverse) {
        angle = 2.0 * PI * f32(k) / f32(N);
    } else {
        angle = -2.0 * PI * f32(k) / f32(N);
    }
    return vec2<f32>(cos(angle), sin(angle));
}
`;

export const BUTTERFLY_SHADER = `${COMPLEX_OPS}

const BANK_WIDTH: u32 = 32u;

fn padded_index(idx: u32, enable_padding: bool) -> u32 {
    if (enable_padding) {
        return idx + (idx / BANK_WIDTH);
    }
    return idx;
}

struct ButterflyParams {
    n: u32,
    stage: u32,
    inverse: u32,
    enable_padding: u32,
}

@group(0) @binding(0) var<uniform> params: ButterflyParams;
@group(0) @binding(1) var<storage, read> input: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> output: array<vec2<f32>>;

var<workgroup> shared_data: array<vec2<f32>, 272>;

@compute @workgroup_size(256)
fn butterfly_stage(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let tid = global_id.x;

    if (tid >= params.n) {
        return;
    }

    let stage = params.stage;
    let inverse = params.inverse != 0u;

    let span = 1u << stage;
    let butterfly_size = span << 1u;

    let pos_in_butterfly = tid % butterfly_size;
    let is_top = pos_in_butterfly < span;

    var partner_idx: u32;
    if (is_top) {
        partner_idx = tid + span;
    } else {
        partner_idx = tid - span;
    }

    let my_val = input[tid];
    let partner_val = input[partner_idx];

    let twiddle_idx = pos_in_butterfly % span;
    let twiddle = twiddle_factor(twiddle_idx, butterfly_size, inverse);

    var result: vec2<f32>;
    if (is_top) {
        let wb = complex_mul(twiddle, partner_val);
        result = complex_add(my_val, wb);
    } else {
        let wb = complex_mul(twiddle, my_val);
        result = complex_sub(partner_val, wb);
    }

    output[tid] = result;
}

@compute @workgroup_size(256)
fn fft_single_pass(@builtin(global_invocation_id) global_id: vec3<u32>,
                   @builtin(local_invocation_id) local_id: vec3<u32>) {
    let tid = local_id.x;
    let n = params.n;
    let inverse = params.inverse != 0u;
    let enable_padding = params.enable_padding != 0u;

    if (tid >= n) {
        return;
    }

    let padded_tid = padded_index(tid, enable_padding);
    shared_data[padded_tid] = input[tid];

    workgroupBarrier();

    let num_stages = u32(log2(f32(n)));

    for (var stage: u32 = 0u; stage < num_stages; stage = stage + 1u) {
        let span = 1u << stage;
        let butterfly_size = span << 1u;

        let pos_in_butterfly = tid % butterfly_size;
        let is_top = pos_in_butterfly < span;

        var partner_idx: u32;
        if (is_top) {
            partner_idx = tid + span;
        } else {
            partner_idx = tid - span;
        }

        let padded_partner = padded_index(partner_idx, enable_padding);

        let my_val = shared_data[padded_tid];
        let partner_val = shared_data[padded_partner];

        let twiddle_idx = pos_in_butterfly % span;
        let twiddle = twiddle_factor(twiddle_idx, butterfly_size, inverse);

        var result: vec2<f32>;
        if (is_top) {
            let wb = complex_mul(twiddle, partner_val);
            result = complex_add(my_val, wb);
        } else {
            let wb = complex_mul(twiddle, my_val);
            result = complex_sub(partner_val, wb);
        }

        workgroupBarrier();
        shared_data[padded_tid] = result;
        workgroupBarrier();
    }

    output[tid] = shared_data[padded_tid];
}
`;

export const BIT_REVERSAL_SHADER = `
fn bit_reverse(x: u32, bits: u32) -> u32 {
    var result: u32 = 0u;
    var val: u32 = x;
    for (var i: u32 = 0u; i < bits; i = i + 1u) {
        result = (result << 1u) | (val & 1u);
        val = val >> 1u;
    }
    return result;
}

struct BitReversalParams {
    n: u32,
    bits: u32,
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
    output[j] = input[i];
}
`;

export const SCALE_SHADER = `
struct ScaleParams {
    n: u32,
    scale: f32,
}

@group(0) @binding(0) var<uniform> params: ScaleParams;
@group(0) @binding(1) var<storage, read_write> data: array<vec2<f32>>;

@compute @workgroup_size(256)
fn scale(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let i = global_id.x;
    if (i >= params.n) {
        return;
    }
    data[i] = data[i] * params.scale;
}
`;

/**
 * GPU-native frequency domain filter shader.
 *
 * NOTE: This shader is reserved for future "GPU-native image filtering" feature.
 * Currently, image filtering uses CPU-based FFT. See README Roadmap for details.
 * Do not delete - this is intentional reserved code for upcoming GPU acceleration.
 */
export const FILTER_SHADER = `
struct FilterParams {
    width: u32,
    height: u32,
    cutoff: f32,
    filter_type: u32,
    filter_shape: u32,
}

@group(0) @binding(0) var<uniform> params: FilterParams;
@group(0) @binding(1) var<storage, read_write> data: array<vec2<f32>>;

fn frequency_distance(x: u32, y: u32, width: u32, height: u32) -> f32 {
    let cx = f32(width) / 2.0;
    let cy = f32(height) / 2.0;

    var dx: f32;
    var dy: f32;

    if (f32(x) < cx) {
        dx = f32(x);
    } else {
        dx = f32(x) - f32(width);
    }

    if (f32(y) < cy) {
        dy = f32(y);
    } else {
        dy = f32(y) - f32(height);
    }

    let dist = sqrt(dx * dx + dy * dy);
    let max_dist = sqrt(cx * cx + cy * cy);
    return dist / max_dist;
}

fn ideal_filter(dist: f32, cutoff: f32, is_lowpass: bool) -> f32 {
    if (is_lowpass) {
        return select(0.0, 1.0, dist <= cutoff);
    } else {
        return select(1.0, 0.0, dist <= cutoff);
    }
}

fn gaussian_filter(dist: f32, cutoff: f32, is_lowpass: bool) -> f32 {
    let sigma = cutoff / 2.0;
    let gaussian = exp(-(dist * dist) / (2.0 * sigma * sigma));
    if (is_lowpass) {
        return gaussian;
    } else {
        return 1.0 - gaussian;
    }
}

@compute @workgroup_size(16, 16)
fn apply_filter(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let x = global_id.x;
    let y = global_id.y;

    if (x >= params.width || y >= params.height) {
        return;
    }

    let idx = y * params.width + x;
    let dist = frequency_distance(x, y, params.width, params.height);

    let is_lowpass = params.filter_type == 0u;
    var mask: f32;

    if (params.filter_shape == 0u) {
        mask = ideal_filter(dist, params.cutoff, is_lowpass);
    } else {
        mask = gaussian_filter(dist, params.cutoff, is_lowpass);
    }

    data[idx] = data[idx] * mask;
}
`;
