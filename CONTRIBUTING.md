# Contributing to xMoney Examples

Thank you for your interest in contributing to xMoney Examples! We welcome contributions from the community and are grateful for your help in making this project better.

## Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/xmoney-examples.git
   cd xmoney-examples
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Create a branch** for your feature or bug fix:

   ```bash
   git checkout -b my-new-feature
   ```

## Development Workflow

### Running the Development Server

Start the development server with hot reload:

```bash
pnpm dev
```

This runs both the frontend (Vite) and backend (Express) servers concurrently.

### Code Style

- We use **Prettier** for code formatting
- Run `pnpm format` to format your code
- Run `pnpm check-format` to check formatting without making changes
- We follow TypeScript best practices and React conventions

### Testing

- Run tests with: `pnpm test`
- Add tests for new features or bug fixes
- Ensure all tests pass before submitting a PR

### Building

- Build for production: `pnpm build`
- Preview production build: `pnpm serve`

## Making Changes

### Adding a New Example

1. Create a new route file in `src/routes/examples/`
2. Follow the existing example structure
3. Include:
   - Live, working demo
   - Source code display
   - Clear documentation
   - Responsive design

### Component Guidelines

- Use TypeScript for type safety
- Follow the existing component patterns
- Use Shadcn UI components when possible
- Ensure components are accessible
- Make components responsive

## Pull Request Process

1. **Update your branch** with the latest changes from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout my-new-feature
   git rebase main
   ```

2. **Ensure your code:**
   - Follows the project's code style
   - Includes tests if applicable
   - Updates documentation as needed
   - Builds without errors

3. **Push your branch** to your fork:

   ```bash
   git push origin my-new-feature
   ```

4. **Submit a Pull Request** to the `main` branch of `xmoney-payments/xmoney-examples`
   - Provide a clear, descriptive title
   - Explain what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes

5. **Respond to feedback** - We may request changes or ask questions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Celebrate others' contributions

## What to Contribute

We welcome contributions in many forms:

- 🐛 **Bug fixes** - Report and fix issues
- ✨ **New examples** - Add new integration patterns
- 🎨 **UI/UX improvements** - Enhance the user experience
- 🔧 **Code quality** - Refactoring and improvements

## Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to xMoney Examples! 🎉
