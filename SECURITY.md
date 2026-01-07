# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of WebGPU FFT Library seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: Use the [Security tab](https://github.com/user/webgpu-fft/security/advisories/new) to privately report a vulnerability.

2. **Email**: Send an email to [security@example.com] with the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.

- **Communication**: We will keep you informed of the progress towards a fix and full announcement.

- **Timeline**: We aim to resolve critical vulnerabilities within 90 days of disclosure.

- **Credit**: We will credit you in the security advisory if you wish (please let us know your preference).

### Safe Harbor

We consider security research conducted in accordance with this policy to be:

- Authorized concerning any applicable anti-hacking laws
- Authorized concerning any relevant anti-circumvention laws
- Exempt from restrictions in our Terms of Service that would interfere with conducting security research

We will not pursue civil action or initiate a complaint to law enforcement for accidental, good-faith violations of this policy.

## Security Best Practices for Users

When using WebGPU FFT Library:

1. **Keep Dependencies Updated**: Regularly update to the latest version to receive security patches.

2. **Validate Input**: Always validate input data before passing it to FFT functions.

3. **Handle Errors**: Properly handle errors and exceptions to prevent information leakage.

4. **Browser Security**: Ensure you're using a browser with up-to-date WebGPU implementation.

5. **Resource Cleanup**: Always call `dispose()` methods to properly release GPU resources.

## Known Security Considerations

### WebGPU Security Model

WebGPU operates within the browser's security sandbox. Key considerations:

- **GPU Memory Isolation**: WebGPU provides memory isolation between different origins.
- **Shader Validation**: All WGSL shaders are validated before execution.
- **Resource Limits**: WebGPU enforces resource limits to prevent denial-of-service.

### Library-Specific Considerations

- **Input Validation**: The library validates input sizes and throws descriptive errors for invalid inputs.
- **No Network Access**: The library does not make any network requests.
- **No File System Access**: The library does not access the file system.
- **No Sensitive Data**: The library does not collect or transmit any user data.

## Vulnerability Disclosure Policy

We follow a coordinated vulnerability disclosure process:

1. Reporter submits vulnerability privately
2. We acknowledge and investigate
3. We develop and test a fix
4. We release the fix and publish a security advisory
5. We credit the reporter (if desired)

Thank you for helping keep WebGPU FFT Library and its users safe!
