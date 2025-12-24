# Super Admin Dashboard Layout

## Overview
This feature implements the Super Admin Dashboard for the appointment system, providing administrators with a comprehensive interface to manage companies, settings, and view system information.

## Features Implemented

### 1. Admin Layout (AdminLayout.js)
- **Sidebar Navigation**: Clean, modern sidebar with menu items
- **Responsive Design**: Mobile-friendly layout
- **Active State**: Highlights current page in navigation
- **User Info Display**: Shows admin phone number with avatar

### 2. Companies Management (Companies.js)
- **Company List Table**: Displays all registered companies
- **Search Functionality**: Search companies by name
- **Filter Options**: Filter by company status
- **Pagination**: Navigate through company pages
- **CRUD Operations**: Edit and delete company entries
- **Checkbox Selection**: Select multiple companies
- **Add New Company**: Button to add new companies

### 3. Additional Pages
- **Home Page**: Welcome dashboard for admin
- **Settings Page**: System configuration interface

## Routes

### Admin Routes (Protected)
- `/admin/home` - Admin home page
- `/admin/companies` - Company management page
- `/admin/settings` - System settings page

## File Structure

```
frontend/src/pages/Admin/
├── AdminLayout.js          # Main admin layout with sidebar
├── AdminLayout.css         # Layout styles
├── Companies.js            # Company management page
├── Companies.css           # Company page styles
├── Home.js                 # Admin home page
├── Home.css                # Home page styles
├── Settings.js             # Settings page
└── Settings.css            # Settings page styles
```

## Usage

### Accessing Admin Dashboard
Navigate to `/admin/companies` to view the company management interface.

### Navigation
Use the sidebar menu to switch between:
- Home Page
- Companies (Company List)
- Settings

## Design Features

### Color Scheme
- Primary: `#5e6fff` (Blue for active states and buttons)
- Background: `#f5f7fa` (Light gray)
- Text: `#1f2937` (Dark gray)
- Borders: `#e8ebed` (Light gray borders)

### Components
1. **Sidebar**
   - Fixed width: 240px
   - White background with subtle border
   - Icon-based navigation
   - Active state highlighting

2. **Header**
   - Greeting with emoji
   - Notification button
   - Responsive menu icon

3. **Company Table**
   - Clean, modern table design
   - Hover effects on rows
   - Action buttons (Edit/Delete)
   - Pagination controls

## Data Structure

### Company Object
```javascript
{
  id: number,
  company: string,
  name: string,
  lastName: string,
  phone: string
}
```

## Future Enhancements
- [ ] Add company creation modal
- [ ] Implement company editing functionality
- [ ] Add role-based authentication
- [ ] Integrate with backend API
- [ ] Add data export functionality
- [ ] Implement advanced filtering
- [ ] Add company details view
- [ ] Add activity logs

## Testing

To test the admin dashboard:

1. Start the frontend server:
   ```
   cd frontend
   npm start
   ```

2. Navigate to: `http://localhost:3000/admin/companies`

3. Test features:
   - Search companies
   - Navigate pages
   - Click edit/delete buttons
   - Switch between menu items

## Notes
- Currently uses mock data (initialCompanies)
- TODO: Connect to backend API for real data
- TODO: Add authentication guard for admin routes
