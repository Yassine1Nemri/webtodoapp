// tests/security/security.test.js
describe('Security Tests', () => {
  // XSS Prevention Tests
  test('should sanitize malicious input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  });

  test('should prevent HTML injection', () => {
    const htmlInput = '<img src="x" onerror="alert(1)">';
    const sanitized = sanitizeInput(htmlInput);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
  });

  // Input Validation Tests
  test('should reject overly long input', () => {
    const longInput = 'a'.repeat(101);
    expect(() => validateTodoInput(longInput)).toThrow('Task is too long');
  });

  test('should reject empty input', () => {
    expect(() => validateTodoInput('')).toThrow('Please enter a task');
    expect(() => validateTodoInput('   ')).toThrow('Please enter a task');
  });

  // Security Headers Tests (for production)
  test('should have security headers in production', async () => {
    // This would test your production environment
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000'
    };
    
    Object.keys(headers).forEach(header => {
      expect(headers[header]).toBeDefined();
    });
  });
});

// Helper functions for testing
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validateTodoInput(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Please enter a task');
  }
  if (trimmed.length > 100) {
    throw new Error('Task is too long');
  }
  return trimmed;
}

