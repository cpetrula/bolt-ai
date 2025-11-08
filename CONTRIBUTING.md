# Contributing to AI Phone Calling System

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork
3. Follow the setup guide in `SETUP.md`
4. Create a branch for your changes

```bash
git checkout -b feature/your-feature-name
```

## Code Style

### Backend (Node.js)

- Use ES6+ features and modules
- Use async/await instead of callbacks
- Follow consistent naming conventions:
  - camelCase for variables and functions
  - PascalCase for classes
- Add error handling for all async operations
- Log important events and errors

Example:
```javascript
async function processCall(callData) {
  try {
    const result = await dbService.logCall(callData);
    console.log('Call logged:', result);
    return result;
  } catch (error) {
    console.error('Error processing call:', error);
    throw error;
  }
}
```

### Frontend (Vue.js)

- Use Composition API with `<script setup>`
- Use computed properties for derived state
- Keep components focused and reusable
- Follow Vue.js style guide
- Use Tailwind CSS for styling

Example:
```vue
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}
</script>
```

## Project Structure

### Adding New Features

#### Backend Service
1. Create a new file in `backend/` (e.g., `smsService.js`)
2. Export a service class or object
3. Import and use in `server.js`

#### Frontend Component
1. Create component in `frontend/src/components/`
2. Import and use in views or other components

#### API Endpoint
1. Add route in `backend/server.js`
2. Create corresponding method in `frontend/src/services/api.js`
3. Use in Pinia store or component

## Testing

Currently, the project doesn't have automated tests. When adding tests:

```bash
# Backend
cd backend
npm install --save-dev jest
npm test

# Frontend
cd frontend
npm install --save-dev vitest
npm test
```

## Pull Request Process

1. **Update documentation** if adding features
2. **Test thoroughly** locally before submitting
3. **Write clear commit messages**
   - Use present tense ("Add feature" not "Added feature")
   - Reference issues if applicable
4. **Create descriptive PR**
   - Explain what and why
   - Include screenshots for UI changes
   - List breaking changes if any

## Feature Ideas

### High Priority
- [ ] Call recording storage
- [ ] Advanced NLP for better lead extraction
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Call analytics dashboard
- [ ] Appointment scheduling

### Medium Priority
- [ ] SMS follow-ups
- [ ] Multi-language support
- [ ] Custom AI agent personalities
- [ ] A/B testing for scripts
- [ ] Call queuing system

### Nice to Have
- [ ] Mobile app
- [ ] Voicemail handling
- [ ] Call transfer capability
- [ ] Conference calling
- [ ] IVR menu builder

## Architecture Decisions

### Why Node.js?
- Excellent WebSocket support
- Easy integration with modern APIs
- Large ecosystem of packages
- Good for real-time applications

### Why Vue.js?
- Easy to learn and use
- Great documentation
- PrimeVue provides rich components
- Vite for fast development

### Why Supabase?
- PostgreSQL database
- Real-time subscriptions
- Easy to use API
- Built-in authentication (for future)

## Common Patterns

### Error Handling
```javascript
try {
  const result = await someAsyncOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: error.message };
}
```

### API Response Format
```javascript
// Success
{ success: true, data: {...}, message: "Optional message" }

// Error
{ success: false, error: "Error message", code: "ERROR_CODE" }
```

### WebSocket Message Format
```javascript
// Twilio → Server
{
  event: "media",
  streamSid: "...",
  media: { payload: "base64audio" }
}

// Server → Twilio
{
  event: "media",
  streamSid: "...",
  media: { payload: "base64audio" }
}
```

## Debugging Tips

### Backend Debugging
```javascript
// Add detailed logging
console.log('Debug:', { variable1, variable2 });

// Use Node.js debugger
node --inspect server.js
```

### Frontend Debugging
```javascript
// Vue Devtools (browser extension)
// Console logging
console.log('Component state:', data);
```

### WebSocket Debugging
```javascript
// Log all messages
ws.on('message', (message) => {
  console.log('Received:', message);
});
```

## Security Guidelines

- Never commit API keys or secrets
- Validate all user input
- Sanitize data before database insertion
- Use parameterized queries
- Implement rate limiting for public endpoints
- Keep dependencies updated
- Review security advisories

## Documentation

When adding features, update:
- `README.md` - Main documentation
- `SETUP.md` - Setup instructions if changed
- `QUICK_REFERENCE.md` - API endpoints, commands
- Code comments for complex logic

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review similar implementations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
