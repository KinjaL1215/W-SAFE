# Contributing to W-SAFE

Thank you for your interest in contributing to W-SAFE! This document will guide you through the contribution process.

## Code of Conduct

- Be respectful and inclusive
- Focus on women's safety and security
- Maintain professional standards
- Report safety concerns immediately

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/W-SAFE.git
   cd W-SAFE
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a `.env` file**
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

## Development Guidelines

### Code Style
- **Naming**: Use camelCase for variables and functions, PascalCase for classes
- **Formatting**: Use 2-space indentation
- **Comments**: Add JSDoc comments for functions
- **Error Handling**: Always include try-catch blocks

### Example Function
```javascript
/**
 * Validates user email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
```

### Commit Standards
- Use meaningful commit messages
- Reference issues when applicable
- Follow the format: `type(scope): description`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(auth): add email verification
fix(sos): correct emergency contact bug
docs(api): update endpoint documentation
```

## Project Structure

```
src/
├── controllers/    - Business logic handlers
├── models/         - Database schemas
├── routes/         - API endpoints
├── middleware/     - Express middleware
├── utils/          - Utility functions
├── public/         - Frontend assets
└── views/          - HTML templates
```

## Testing

Before submitting:
1. Test all endpoints with tools like Postman
2. Verify error handling works correctly
3. Check that validation is properly applied
4. Test with invalid inputs

## Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots if UI changes

3. **PR Template**
   ```
   ## Description
   Brief description of your changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update

   ## How Has This Been Tested?
   Describe testing approach

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Error handling implemented
   - [ ] Tests added (if applicable)
   ```

## Areas for Contribution

### High Priority
- [ ] JWT authentication implementation
- [ ] Rate limiting for APIs
- [ ] Unit and integration tests
- [ ] Improved UI/UX design
- [ ] Mobile app features

### Medium Priority
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Advanced location features
- [ ] SMS notifications

### Documentation
- [ ] API documentation improvements
- [ ] Setup guides
- [ ] Troubleshooting guides
- [ ] Video tutorials

## Security Considerations

- Never commit sensitive information
- Always validate and sanitize inputs
- Use environment variables for secrets
- Report security issues privately
- Keep dependencies updated

## Dependencies

Before adding new packages:
1. Check if existing packages provide the functionality
2. Verify security by checking npm audit
3. Ensure the package is actively maintained
4. Discuss in an issue first for major changes

## Performance Guidelines

- Minimize database queries
- Use proper indexing
- Implement caching where appropriate
- Optimize file sizes
- Monitor response times

## Documentation Requirements

All new features must include:
- JSDoc comments for functions
- README updates if user-facing
- API documentation updates
- Example usage code

## Review Process

1. **Code Review**: Maintainers will review your code
2. **Feedback**: Address any requested changes
3. **Approval**: PR may be approved once all checks pass
4. **Merge**: Your contribution will be merged!

## Reporting Issues

Found a bug? Please report it:
1. Check if issue already exists
2. Provide clear description
3. Include steps to reproduce
4. Add relevant error messages
5. Include environment details

**Issue Template**:
```
## Description
Clear description of the issue

## Steps to Reproduce
1. First step
2. Second step
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows, macOS]
- Node: [e.g., 14.x]
- Browser: [e.g., Chrome 90]
```

## Questions?

- Open a discussion in GitHub Discussions
- Email: wsafe181@gmail.com
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make the world a safer place!** 🛡️
