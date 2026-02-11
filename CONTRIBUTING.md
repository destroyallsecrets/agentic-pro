# Contributing to Agentic Pro

Thank you for your interest in contributing to Agentic Pro! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agentic-pro.git
   cd agentic-pro
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Workflow

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Code Style

- **TypeScript**: All new code should be written in TypeScript
- **Formatting**: We use Prettier (run `npm run format` before committing)
- **Linting**: Ensure `npm run lint` passes before submitting

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new agent communication protocol
fix: resolve state persistence bug
docs: update installation instructions
chore: upgrade dependencies
```

## 🧪 Testing

Before submitting a PR:

1. **Test locally**: Ensure the dev server runs without errors
2. **Check the build**: Run `npm run build` to verify production builds
3. **Test key features**:
   - Bootstrap a swarm
   - Monitor agent communication
   - Test persistence (refresh the page)
   - Verify Intervention Mode

## 📝 Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add yourself** to the contributors list in `package.json` (optional)
3. **Create a PR** with a clear title and description:
   - What problem does this solve?
   - How did you test it?
   - Any breaking changes?

4. **Wait for review**: A maintainer will review your PR and may request changes

## 🎯 Areas for Contribution

### High Priority
- **Performance optimization**: Reduce re-renders in the network graph
- **Error handling**: Improve error messages and recovery
- **Mobile responsiveness**: Optimize UI for smaller screens

### Feature Requests
- **Agent templates**: Pre-built agent configurations for common tasks
- **Export/Import**: Save and load swarm configurations
- **Analytics**: Track agent performance metrics over time

### Documentation
- **Tutorials**: Step-by-step guides for common use cases
- **API documentation**: Document the Gemini service integration
- **Architecture diagrams**: Visual explanations of the system

## 🐛 Reporting Bugs

Use the [GitHub Issues](https://github.com/destroyallsecrets/agentic-pro/issues) page to report bugs. Include:

- **Description**: What happened vs. what you expected
- **Steps to reproduce**: Detailed steps to trigger the bug
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Provide a clear use case
3. Explain why this would benefit other users

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 🙏 Thank You

Every contribution, no matter how small, helps make Agentic Pro better. We appreciate your time and effort!

---

**Questions?** Open a [Discussion](https://github.com/destroyallsecrets/agentic-pro/discussions) or reach out to the maintainers.
