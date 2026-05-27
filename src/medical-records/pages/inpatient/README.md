# Inpatient Registration Design

## Overview
This is an advanced inpatient registration system with a modern, intuitive interface that allows healthcare staff to efficiently manage patient admissions.

## Key Features

### 1. Ward Selection
- **Visual Ward Cards**: Interactive cards displaying ward information including:
  - Ward name and type (General, ICU, Maternity, Pediatric, Surgical)
  - Floor location
  - Total beds and available beds count
  - Color-coded availability indicators

### 2. Bed Layout Visualization
- **Interactive Bed Grid**: Visual representation of all beds in the selected ward
- **Status Indicators**:
  - 🟢 Green: Available beds
  - 🔴 Red: Occupied beds
  - 🟡 Yellow: Maintenance beds
  - 🔵 Blue: Reserved beds
- **Bed Information**: Each bed shows:
  - Bed number (e.g., GEN-001)
  - Current status
  - Patient name and OP number (for occupied beds)

### 3. Patient Selection
- **OP Number Input**: When clicking an available bed, a modal appears for OP number entry
- **Patient Search**: Search functionality to find existing patients by OP number
- **Auto-population**: Patient details are automatically populated after search

### 4. Comprehensive Registration Form
- **Patient Information Section**:
  - OP Number (read-only after search)
  - First Name, Second Name
  - Guardian Name
  - Phone Number

- **Admission Details Section**:
  - Admission Date and Time
  - Assigned Doctor (dropdown)
  - Department (dropdown)

- **Medical Information Section**:
  - Diagnosis (textarea)
  - Additional Notes (textarea)

## Design Principles

### User Experience
- **Single Page Design**: All functionality contained in one page for efficiency
- **Progressive Disclosure**: Information revealed step-by-step (ward → beds → patient details)
- **Visual Feedback**: Clear status indicators and hover effects
- **Responsive Layout**: Works on desktop and mobile devices

### Visual Design
- **Modern Card-based Layout**: Clean, professional appearance
- **Gradient Headers**: Eye-catching but professional color schemes
- **Icon Integration**: Meaningful icons for better visual communication
- **Color Coding**: Consistent color scheme for different statuses

### Accessibility
- **Keyboard Navigation**: Enter key support for OP number search
- **Screen Reader Friendly**: Proper labels and ARIA attributes
- **High Contrast**: Clear color differences for status indicators

## Technical Implementation

### Components Used
- React Bootstrap for responsive layout
- React Icons for visual elements
- SweetAlert2 for user notifications
- Custom CSS for enhanced styling

### State Management
- Local state for ward selection, bed data, and patient information
- Modal state management for different interaction flows

### Mock Data Structure
- Ward interface with id, name, type, bed counts, and floor
- Bed interface with id, number, status, and patient information
- Patient interface with comprehensive admission details

## Workflow

1. **Select Ward**: User clicks on a ward card to view its bed layout
2. **Choose Bed**: User clicks on an available bed to initiate admission
3. **Enter OP Number**: Modal appears for patient search by OP number
4. **Patient Details**: Patient information is populated automatically
5. **Complete Registration**: Fill admission details and submit

## Future Enhancements

- Real-time bed status updates
- Drag-and-drop bed assignment
- Bulk patient registration
- Integration with hospital information systems
- Advanced search and filtering options
- Bed maintenance scheduling
- Patient transfer between wards