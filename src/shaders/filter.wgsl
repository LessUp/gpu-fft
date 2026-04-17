// ============================================================================
// REFERENCE COPY - DO NOT EDIT
// This file is a reference copy only. The canonical source is in sources.ts.
// Edit src/shaders/sources.ts and run build to update this file if needed.
// ============================================================================

// Frequency-domain filter shader

struct FilterParams {
    width: u32,
    height: u32,
    cutoff: f32,        // Cutoff frequency (0.0 to 1.0)
    filter_type: u32,   // 0 = lowpass, 1 = highpass
    filter_shape: u32,  // 0 = ideal, 1 = gaussian
}

@group(0) @binding(0) var<uniform> params: FilterParams;
@group(0) @binding(1) var<storage, read_write> data: array<vec2<f32>>;

// Compute distance from center in frequency domain (normalized to [0, 1])
fn frequency_distance(x: u32, y: u32, width: u32, height: u32) -> f32 {
    let cx = f32(width) / 2.0;
    let cy = f32(height) / 2.0;
    let fx = f32(x);
    let fy = f32(y);
    
    var dx: f32;
    var dy: f32;
    
    // Handle FFT shift (DC at center)
    if (fx < cx) {
        dx = fx;
    } else {
        dx = fx - f32(width);
    }
    
    if (fy < cy) {
        dy = fy;
    } else {
        dy = fy - f32(height);
    }
    
    let dist = sqrt(dx * dx + dy * dy);
    let max_dist = sqrt(cx * cx + cy * cy);
    return dist / max_dist;
}

// Ideal filter (sharp cutoff)
fn ideal_filter(dist: f32, cutoff: f32, is_lowpass: bool) -> f32 {
    if (is_lowpass) {
        return select(0.0, 1.0, dist <= cutoff);
    } else {
        return select(1.0, 0.0, dist <= cutoff);
    }
}

// Gaussian filter (smooth falloff)
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
        // Ideal filter
        mask = ideal_filter(dist, params.cutoff, is_lowpass);
    } else {
        // Gaussian filter
        mask = gaussian_filter(dist, params.cutoff, is_lowpass);
    }
    
    // Apply mask to complex data
    data[idx] = data[idx] * mask;
}
