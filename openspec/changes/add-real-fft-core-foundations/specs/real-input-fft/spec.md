## ADDED Requirements

### Requirement: Library SHALL provide 1D real-input FFT APIs
The library SHALL expose `rfft()` and `irfft()` APIs for real-valued 1D signals on both the CPU utility surface and the GPU engine surface.

#### Scenario: Forward real-input transform returns half-spectrum
- **WHEN** a caller passes a real-valued signal of length `N` to `rfft()`
- **THEN** the library SHALL return an interleaved complex half-spectrum containing exactly `N / 2 + 1` frequency bins

#### Scenario: Inverse real-input transform restores original signal length
- **WHEN** a caller passes a valid half-spectrum generated for a real-valued signal of length `N` to `irfft()`
- **THEN** the library SHALL return a real-valued signal of length `N`

### Requirement: Library SHALL provide 2D real-input FFT APIs
The library SHALL expose `rfft2d()` and `irfft2d()` APIs for real-valued 2D inputs on both the CPU utility surface and the GPU engine surface.

#### Scenario: Forward 2D real-input transform returns compressed row-major spectrum
- **WHEN** a caller passes a real-valued image of dimensions `width × height` to `rfft2d()`
- **THEN** the library SHALL return a row-major interleaved complex spectrum with `height × (width / 2 + 1)` frequency bins

#### Scenario: Inverse 2D real-input transform restores original real-valued image
- **WHEN** a caller passes a valid compressed real-input 2D spectrum with the original `width` and `height` to `irfft2d()`
- **THEN** the library SHALL return a real-valued image with exactly `width × height` samples

### Requirement: Real-input transforms SHALL preserve round-trip correctness
The library SHALL preserve input samples through forward and inverse real-input transforms within floating-point tolerance.

#### Scenario: 1D round-trip matches original real signal
- **WHEN** a caller computes `irfft(rfft(signal))` for a valid real-valued 1D signal
- **THEN** the output SHALL match the original signal within floating-point tolerance

#### Scenario: 2D round-trip matches original real image
- **WHEN** a caller computes `irfft2d(rfft2d(image, width, height), width, height)` for a valid real-valued 2D input
- **THEN** the output SHALL match the original image within floating-point tolerance

### Requirement: Real-input transforms SHALL reject invalid real-input contracts
The library SHALL validate real-input dimensions and half-spectrum shapes before executing forward or inverse transforms.

#### Scenario: Reject invalid 1D real-input signal length
- **WHEN** a caller passes a 1D real-valued signal whose length is not a supported power of 2
- **THEN** the library SHALL throw a descriptive `FFTError`

#### Scenario: Reject invalid compressed 2D spectrum shape
- **WHEN** a caller passes a compressed 2D real-input spectrum whose length does not match `height × (width / 2 + 1) × 2`
- **THEN** the library SHALL throw a descriptive `FFTError`
