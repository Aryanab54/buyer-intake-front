# Buyer Lead Intake App - Frontend

A comprehensive React application for managing buyer leads with advanced filtering, search, import/export capabilities, and real-time collaboration features.

## 🚀 Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete buyer leads
- **Advanced Filtering**: Filter by city, property type, status, and timeline
- **Real-time Search**: Debounced search across name, phone, and email
- **Server-side Pagination**: Efficient handling of large datasets (10 items per page)
- **URL-synced Filters**: Shareable URLs with filter states

### Data Management
- **CSV Import**: Bulk import up to 200 leads with validation and error reporting
- **CSV Export**: Export filtered results to CSV format
- **Validation**: Client and server-side validation using Zod schemas
- **Concurrency Control**: Optimistic locking to prevent data conflicts

### User Experience
- **Responsive Design**: Mobile-first Bootstrap UI
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Spinners and disabled states for better UX

### Security & Permissions
- **Authentication**: Magic link login with demo mode
- **Authorization**: Role-based access control (users can only edit their own leads)
- **Rate Limiting**: Built-in protection against abuse
- **Input Sanitization**: XSS protection and data validation

## 🛠 Tech Stack

- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Bootstrap 5** - UI components and styling
- **React Bootstrap** - Bootstrap components for React
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Papa Parse** - CSV parsing
- **React Testing Library** - Unit testing

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API server (see backend README)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Running the Application

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

The application will be available at `http://localhost:3009`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.js # Error handling wrapper
│   ├── ImportModal.js   # CSV import functionality
│   ├── Navbar.js        # Navigation component
│   └── TagInput.js      # Tag management component
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication state management
├── pages/               # Main application pages
│   ├── BuyersList.js    # Lead listing with filters
│   ├── CreateBuyer.js   # Lead creation form
│   ├── Login.js         # Authentication page
│   └── ViewEditBuyer.js # Lead details and editing
├── schemas/             # Zod validation schemas
│   └── buyerSchema.js   # Data validation rules
├── services/            # API communication
│   └── api.js           # HTTP client configuration
├── utils/               # Utility functions
│   ├── csvUtils.js      # CSV import/export helpers
│   └── validation.test.js # Unit tests
├── App.js               # Main application component
├── App.css              # Global styles
└── index.js             # Application entry point
```

## 🔧 Key Components

### BuyersList (`/buyers`)
- **Server-side Rendering**: Real pagination with URL sync
- **Advanced Filtering**: Multiple filter combinations
- **Debounced Search**: 500ms delay for optimal performance
- **Bulk Operations**: CSV import/export
- **Quick Actions**: Status updates via dropdown

### CreateBuyer (`/buyers/new`)
- **Dynamic Validation**: Real-time form validation
- **Conditional Fields**: BHK required only for Apartment/Villa
- **Tag Management**: Add/remove tags with keyboard shortcuts
- **Budget Validation**: Ensures max >= min when both provided

### ViewEditBuyer (`/buyers/:id`)
- **Tabbed Interface**: Details and history in separate tabs
- **Concurrency Control**: Prevents conflicting updates
- **Change History**: Last 5 modifications with diff tracking
- **Permission Checks**: Edit/delete based on ownership

### ImportModal
- **File Validation**: CSV format and size checks
- **Row-by-row Validation**: Detailed error reporting
- **Transaction Safety**: All-or-nothing import for valid rows
- **Template Download**: Sample CSV for reference

## 🎨 Design System

### Color Scheme
- **Primary**: Bootstrap blue (#007bff)
- **Success**: Green for positive actions
- **Warning**: Yellow for caution states
- **Danger**: Red for destructive actions
- **Light**: Background and subtle elements

### Typography
- **Headings**: Bootstrap heading classes (h1-h6)
- **Body**: Default Bootstrap font stack
- **Code**: Monospace for technical content

### Spacing
- **Consistent**: Bootstrap spacing utilities (mb-3, p-4, etc.)
- **Responsive**: Mobile-first approach with breakpoints

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test validation.test.js

# Run with coverage
npm test -- --coverage --watchAll=false
```

### Test Coverage
- **Validation Logic**: Zod schema validation
- **Utility Functions**: CSV parsing and formatting
- **Component Logic**: Form validation and data transformation

### Manual Testing Checklist
- [ ] Create lead with all field combinations
- [ ] Filter and search functionality
- [ ] CSV import with various data scenarios
- [ ] CSV export with filtered data
- [ ] Edit lead with concurrency scenarios
- [ ] Permission-based access control
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## 🔒 Security Features

### Input Validation
- **Client-side**: Immediate feedback with Zod schemas
- **Server-side**: Backend validation for security
- **XSS Protection**: Input sanitization and encoding

### Authentication
- **Magic Links**: Secure passwordless authentication
- **Demo Mode**: No backend required for testing
- **Token Management**: Secure storage and transmission

### Authorization
- **Ownership**: Users can only edit their own leads
- **Admin Override**: Admin role can edit all leads
- **API Protection**: All requests include authentication

## 📱 Accessibility

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: Meets AA standards
- **Focus Management**: Visible focus indicators

### Features
- **Form Labels**: All inputs properly labeled
- **Error Announcements**: Screen reader notifications
- **Skip Links**: Navigation shortcuts
- **Semantic HTML**: Proper heading hierarchy

## 🚀 Performance Optimizations

### Code Splitting
- **Route-based**: Automatic splitting by React Router
- **Component-based**: Lazy loading for heavy components

### Data Management
- **Debounced Search**: Reduces API calls
- **Pagination**: Limits data transfer
- **Caching**: Browser caching for static assets

### Bundle Optimization
- **Tree Shaking**: Removes unused code
- **Minification**: Compressed production builds
- **Asset Optimization**: Optimized images and fonts

## 🐛 Error Handling

### Error Boundaries
- **Component Errors**: Graceful fallback UI
- **Network Errors**: Retry mechanisms
- **Validation Errors**: User-friendly messages

### Logging
- **Console Errors**: Development debugging
- **User Feedback**: Clear error messages
- **Recovery Options**: Refresh and retry buttons

## 🔄 State Management

### Local State
- **Form Data**: Component-level state
- **UI State**: Loading, errors, modals

### Context API
- **Authentication**: User session management
- **Theme**: Future dark mode support

### URL State
- **Filters**: Shareable filter combinations
- **Pagination**: Bookmarkable page states

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Bulk edit operations
- [ ] Custom field support
- [ ] Integration with CRM systems

### Technical Improvements
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Advanced caching strategies
- [ ] Performance monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- **ESLint**: Follow configured rules
- **Prettier**: Consistent code formatting
- **Testing**: Add tests for new features
- **Documentation**: Update README for changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
- **CORS Errors**: Check backend configuration
- **Build Failures**: Clear node_modules and reinstall
- **Test Failures**: Ensure all dependencies are installed

### Getting Help
- Check existing GitHub issues
- Create new issue with reproduction steps
- Include browser console errors
- Provide system information

---

Built with ❤️ using React and Bootstrap