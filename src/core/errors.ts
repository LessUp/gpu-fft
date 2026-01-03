// FFT Error handling

export enum FFTErrorCode {
  WEBGPU_NOT_AVAILABLE = 'WEBGPU_NOT_AVAILABLE',
  INVALID_INPUT_SIZE = 'INVALID_INPUT_SIZE',
  INPUT_TOO_LARGE = 'INPUT_TOO_LARGE',
  BUFFER_ALLOCATION_FAILED = 'BUFFER_ALLOCATION_FAILED',
  SHADER_COMPILATION_FAILED = 'SHADER_COMPILATION_FAILED',
  DEVICE_LOST = 'DEVICE_LOST'
}

export class FFTError extends Error {
  constructor(message: string, public code: FFTErrorCode) {
    super(message);
    this.name = 'FFTError';
  }
}
