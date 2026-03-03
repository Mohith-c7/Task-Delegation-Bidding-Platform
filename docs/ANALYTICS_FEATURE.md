# Task Analytics Dashboard Feature

## Overview
The Analytics Dashboard provides comprehensive insights into task management, bidder performance, and platform usage metrics. This feature helps organizations track productivity, identify top performers, and make data-driven decisions.

## Features

### 1. Dashboard Analytics (`/analytics`)
A comprehensive overview of platform-wide metrics including:

#### Summary Metrics
- **Total Tasks**: Overall count of all tasks in the system
- **Open Tasks**: Tasks currently available for bidding
- **Completed Tasks**: Successfully finished tasks
- **Total Bids**: All bids placed across the platform
- **Average Completion Time**: Mean time to complete tasks (in hours)
- **Task Completion Rate**: Percentage of tasks successfully completed

#### Visual Analytics
- **Task Trends Chart**: Line chart showing task creation and completion over time
- **Priority Distribution**: Doughnut chart displaying tasks by priority (Low, Medium, High, Critical)
- **Status Distribution**: Doughnut chart showing tasks by status (Open, Assigned, In Progress, Completed, Closed)
- **Skill Demand Chart**: Bar chart highlighting most requested skills

#### Performance Tables
- **Top Bidders**: Ranked list showing:
  - Total bids placed
  - Success rate (bid approval percentage)
  - Completed tasks
  - On-time vs late completions
  - Average completion time

- **Top Task Owners**: Ranked list showing:
  - Tasks posted
  - Tasks completed
  - Average bids per task

### 2. Personal Analytics (`/my-analytics`)
Individual performance metrics for the logged-in user:

#### Performance Score
- Overall score calculated from success rate and on-time delivery
- Visual indicator of user performance

#### As Task Owner
- Total tasks posted
- Tasks completed
- Completion rate

#### As Bidder
- Total bids placed
- Bids won
- Win rate (success rate)
- Average completion time
- On-time delivery rate

#### Performance Insights
- Automated feedback based on metrics
- Suggestions for improvement
- Recognition for excellent performance

## API Endpoints

### Get Dashboard Analytics
```
GET /api/v1/analytics/dashboard?days=30
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30, max: 365)

**Response:**
```json
{
  "status": "success",
  "message": "Analytics retrieved successfully",
  "data": {
    "summary": {
      "total_tasks": 150,
      "open_tasks": 25,
      "completed_tasks": 100,
      "in_progress_tasks": 15,
      "total_bids": 450,
      "average_completion_time_hours": 48.5,
      "task_completion_rate": 66.67,
      "tasks_by_priority": {
        "low": 30,
        "medium": 60,
        "high": 40,
        "critical": 20
      },
      "tasks_by_status": {
        "open": 25,
        "assigned": 10,
        "in_progress": 15,
        "completed": 100,
        "closed": 0
      }
    },
    "task_trends": [
      {
        "date": "2024-01-01",
        "created": 5,
        "completed": 3
      }
    ],
    "top_bidders": [
      {
        "bidder_id": "uuid",
        "bidder_name": "John Doe",
        "bidder_email": "john@example.com",
        "total_bids": 50,
        "approved_bids": 35,
        "completed_tasks": 30,
        "success_rate": 70.0,
        "average_completion_time_hours": 42.5,
        "on_time_completions": 25,
        "late_completions": 5
      }
    ],
    "top_task_owners": [
      {
        "owner_id": "uuid",
        "owner_name": "Jane Smith",
        "owner_email": "jane@example.com",
        "tasks_posted": 45,
        "tasks_completed": 40,
        "average_bids_per_task": 3.2
      }
    ],
    "skill_demands": [
      {
        "skill": "React",
        "task_count": 35,
        "bid_count": 120
      }
    ],
    "generated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get User Analytics
```
GET /api/v1/analytics/me
```

**Response:**
```json
{
  "status": "success",
  "message": "User analytics retrieved successfully",
  "data": {
    "user_id": "uuid",
    "tasks_posted": 20,
    "tasks_completed": 15,
    "bids_placed": 30,
    "bids_won": 18,
    "success_rate": 60.0,
    "average_completion_time_hours": 45.5,
    "on_time_rate": 83.33
  }
}
```

## Database Queries

The analytics feature uses optimized SQL queries with:
- Aggregation functions (COUNT, AVG, SUM)
- Window functions for rankings
- CTEs (Common Table Expressions) for complex calculations
- Date series generation for trend analysis
- Efficient joins to minimize database load

## Frontend Components

### Analytics.tsx
Main dashboard component featuring:
- Chart.js integration for visualizations
- TanStack Query for data fetching
- Responsive grid layout
- Time range selector (7, 30, 90, 365 days)

### MyAnalytics.tsx
Personal performance component with:
- Performance score calculation
- Dual-role metrics (owner and bidder)
- Automated insights and recommendations
- Visual indicators for performance levels

## Installation

### Backend
No additional dependencies required. The analytics feature uses existing Go packages.

### Frontend
Install Chart.js dependencies:
```bash
cd frontend
npm install chart.js react-chartjs-2
```

## Usage

1. **Access Dashboard Analytics**
   - Navigate to `/analytics` in the application
   - Select desired time range (7, 30, 90, or 365 days)
   - View comprehensive platform metrics

2. **View Personal Performance**
   - Navigate to `/my-analytics`
   - Review your performance score
   - Check insights and recommendations

3. **API Integration**
   - Use the analytics endpoints in your custom dashboards
   - Integrate metrics into reports
   - Build custom visualizations

## Performance Considerations

- Analytics queries are optimized with proper indexing
- Results can be cached for frequently accessed data
- Time range limits prevent excessive data processing
- Pagination available for large result sets

## Future Enhancements

- Export analytics to PDF/Excel
- Custom date range selection
- Team-level analytics
- Predictive analytics using ML
- Real-time analytics updates
- Comparative analysis between time periods
- Custom metric definitions
- Alert system for performance thresholds

## Security

- All analytics endpoints require authentication
- Users can only view their own detailed analytics
- Dashboard analytics show aggregated, anonymized data
- Role-based access control for sensitive metrics

## Testing

Test the analytics feature:

```bash
# Backend tests
cd backend
go test ./internal/repository -run TestAnalytics
go test ./internal/services -run TestAnalytics

# Frontend tests
cd frontend
npm test -- Analytics
```

## Troubleshooting

### No data showing
- Ensure tasks and bids exist in the database
- Check date range selection
- Verify API endpoint connectivity

### Slow performance
- Reduce time range
- Check database indexes
- Consider implementing caching

### Chart rendering issues
- Verify Chart.js installation
- Check browser console for errors
- Ensure data format matches chart requirements
