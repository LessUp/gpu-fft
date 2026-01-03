// Complex number operations for FFT
// Complex numbers are represented as vec2<f32> where x = real, y = imaginary

const PI: f32 = 3.14159265358979323846;

// Complex addition: (a + bi) + (c + di) = (a+c) + (b+d)i
fn complex_add(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x + b.x, a.y + b.y);
}

// Complex subtraction: (a + bi) - (c + di) = (a-c) + (b-d)i
fn complex_sub(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x - b.x, a.y - b.y);
}

// Complex multiplication: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
fn complex_mul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

// Complex magnitude: |a + bi| = sqrt(a² + b²)
fn complex_magnitude(c: vec2<f32>) -> f32 {
    return sqrt(c.x * c.x + c.y * c.y);
}

// Complex conjugate: conj(a + bi) = a - bi
fn complex_conj(c: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(c.x, -c.y);
}

// Twiddle factor for FFT: e^(-2πik/N) = cos(-2πk/N) + i·sin(-2πk/N)
fn twiddle_factor(k: u32, N: u32) -> vec2<f32> {
    let angle = -2.0 * PI * f32(k) / f32(N);
    return vec2<f32>(cos(angle), sin(angle));
}

// Twiddle factor for IFFT: e^(+2πik/N) = cos(2πk/N) + i·sin(2πk/N)
fn twiddle_factor_inverse(k: u32, N: u32) -> vec2<f32> {
    let angle = 2.0 * PI * f32(k) / f32(N);
    return vec2<f32>(cos(angle), sin(angle));
}

// Scale complex number by real scalar
fn complex_scale(c: vec2<f32>, s: f32) -> vec2<f32> {
    return vec2<f32>(c.x * s, c.y * s);
}
