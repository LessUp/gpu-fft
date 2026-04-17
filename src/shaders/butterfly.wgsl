// ============================================================================
// REFERENCE COPY - DO NOT EDIT
// This file is a reference copy only. The canonical source is in sources.ts.
// Edit src/shaders/sources.ts and run build to update this file if needed.
// ============================================================================

// FFT Butterfly operation shader with Bank Conflict optimization

const PI: f32 = 3.14159265358979323846;
const BANK_WIDTH: u32 = 32u;

// Complex number operations
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

// Twiddle factor: e^(-2πik/N) for FFT, e^(+2πik/N) for IFFT
fn twiddle_factor(k: u32, N: u32, inverse: bool) -> vec2<f32> {
    var angle: f32;
    if (inverse) {
        angle = 2.0 * PI * f32(k) / f32(N);
    } else {
        angle = -2.0 * PI * f32(k) / f32(N);
    }
    return vec2<f32>(cos(angle), sin(angle));
}

// Bank conflict avoidance: compute padded index
fn padded_index(idx: u32, enable_padding: bool) -> u32 {
    if (enable_padding) {
        return idx + (idx / BANK_WIDTH);
    }
    return idx;
}

// Uniforms for butterfly stage
struct ButterflyParams {
    n: u32,              // Total FFT size
    stage: u32,          // Current stage (0 to log2(n)-1)
    inverse: u32,        // 0 for FFT, 1 for IFFT
    enable_padding: u32, // 1 to enable bank conflict optimization
}

@group(0) @binding(0) var<uniform> params: ButterflyParams;
@group(0) @binding(1) var<storage, read> input: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> output: array<vec2<f32>>;

// Workgroup shared memory for intermediate results
// Size includes padding for bank conflict avoidance
var<workgroup> shared_data: array<vec2<f32>, 272>; // 256 + 256/32 = 264, rounded up

@compute @workgroup_size(256)
fn butterfly_stage(@builtin(global_invocation_id) global_id: vec3<u32>,
                   @builtin(local_invocation_id) local_id: vec3<u32>,
                   @builtin(workgroup_id) workgroup_id: vec3<u32>) {
    let tid = global_id.x;
    let local_tid = local_id.x;
    
    if (tid >= params.n) {
        return;
    }
    
    let stage = params.stage;
    let inverse = params.inverse != 0u;
    let enable_padding = params.enable_padding != 0u;
    
    // Butterfly span for this stage: 2^stage
    let span = 1u << stage;
    let butterfly_size = span << 1u; // 2 * span
    
    // Determine which butterfly this thread belongs to
    let butterfly_idx = tid / butterfly_size;
    let pos_in_butterfly = tid % butterfly_size;
    
    // Determine if this is the top or bottom of the butterfly
    let is_top = pos_in_butterfly < span;
    
    // Calculate partner index
    var partner_idx: u32;
    if (is_top) {
        partner_idx = tid + span;
    } else {
        partner_idx = tid - span;
    }
    
    // Load data
    let my_val = input[tid];
    let partner_val = input[partner_idx];
    
    // Calculate twiddle factor index
    let twiddle_idx = pos_in_butterfly % span;
    let twiddle = twiddle_factor(twiddle_idx, butterfly_size, inverse);
    
    // Perform butterfly operation
    var result: vec2<f32>;
    if (is_top) {
        // Top: a + W * b
        let wb = complex_mul(twiddle, partner_val);
        result = complex_add(my_val, wb);
    } else {
        // Bottom: a - W * b (where a is the top value)
        let wb = complex_mul(twiddle, my_val);
        result = complex_sub(partner_val, wb);
    }
    
    output[tid] = result;
}

// Single-pass FFT for small sizes (fits in workgroup)
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
    
    // Load to shared memory with padding
    let padded_tid = padded_index(tid, enable_padding);
    shared_data[padded_tid] = input[tid];
    
    workgroupBarrier();
    
    // Perform all butterfly stages
    let num_stages = u32(log2(f32(n)));
    
    for (var stage: u32 = 0u; stage < num_stages; stage = stage + 1u) {
        let span = 1u << stage;
        let butterfly_size = span << 1u;
        
        let butterfly_idx = tid / butterfly_size;
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
    
    // Write back to global memory
    output[tid] = shared_data[padded_tid];
}
