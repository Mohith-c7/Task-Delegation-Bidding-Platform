# Analytics Feature Setup Guide

## Quick Setup

### Backend Setup

1. **Run Database Migrations**
   ```bash
   cd backend
   make migrate-up
   ```
   This will create the necessary indexes for optimal analytics performance.

2. **Verify Backend is Running**
   ```bash
   make run
   ```
   The analytics endpoints will be available at:
   - `http://localhost:8080/api/v1/analytics/dashboard`
   - `http://localhost:8080/api/v1/analytics/me`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```
   This will install Chart.js and react-chartjs-2 for data visualization.

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Analytics Pages**
   - Dashboard Analytics: `http://localhost:5173/analytics`
   - Personal Analytics: `http://localhost:5173/my-analytics`

## Testing the Feature

### 1. Generate Sample Data (Optional)

If you want to test with sample data, you can create some tasks and bids:

```bash
# Create a few tasks via the UI or API
# Place some bids on those tasks
# Complete some tasks to see completion metrics
```

### 2. Test Analytics Endpoints

```bash
# Get dashboard analytics (last 30 days)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/analytics/dashboard?days=30

# Get personal analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/analytics/me
```

### 3. Verify Frontend

1. Login to the application
2. Navigate to "Analytics" in the navigation menu
3. You should see:
   - Summary cards with metrics
   - Task trends chart
   - Priority and status distribution charts
   - Top bidders and task owners tables
   - Skill demand chart

4. Navigate to "My Performance"
5. You should see:
   - Your performance score
   - Stats as task owner and bidder
   - Performance insights

## Configuration

### Time Range Options

The dashboard analytics supports the following time ranges:
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Last year (365 days)

### Performance Optimization

For large datasets, consider:

1. **Database Indexing** (already included in migration)
   - Indexes on status, priority, dates
   - Composite indexes for common queries

2. **Caching** (optional enhancement)
   ```go
   // Add Redis caching for analytics results
   // Cache key: analytics:dashboard:{days}
   // TTL: 5-15 minutes
   ```

3. **Query Limits**
   - Top bidders: Limited to 10
   - Top task owners: Limited to 10
   - Skill demands: Limited to 10

## Troubleshooting

### Issue: "No data available"

**Solution:**
- Ensure you have tasks and bids in the database
- Check that tasks have been completed (for completion metrics)
- Verify the date range includes your data

### Issue: "Failed to load analytics"

**Solution:**
- Check backend is running: `curl http://localhost:8080/health`
- Verify authentication token is valid
- Check browser console for errors
- Verify database connection

### Issue: Charts not rendering

**Solution:**
- Clear browser cache
- Verify Chart.js is installed: `npm list chart.js`
- Check for JavaScript errors in console
- Ensure data format matches chart requirements

### Issue: Slow performance

**Solution:**
- Reduce time range (use 7 or 30 days instead of 365)
- Verify database indexes are created
- Check database query performance
- Consider implementing caching

## Feature Verification Checklist

- [ ] Backend migrations run successfully
- [ ] Analytics endpoints respond correctly
- [ ] Frontend dependencies installed
- [ ] Navigation links appear in menu
- [ ] Dashboard analytics page loads
- [ ] Charts render correctly
- [ ] Personal analytics page loads
- [ ] Performance score calculates correctly
- [ ] Time range selector works
- [ ] Tables display data properly

## Next Steps

After setup, you can:

1. **Customize Metrics**
   - Add custom KPIs in `analytics_repo.go`
   - Create new chart types in frontend

2. **Add Export Functionality**
   - PDF export for reports
   - CSV export for data analysis

3. **Implement Caching**
   - Redis caching for frequently accessed data
   - Reduce database load

4. **Add Real-time Updates**
   - WebSocket integration
   - Auto-refresh analytics data

5. **Create Custom Dashboards**
   - Team-specific analytics
   - Manager dashboards
   - Executive summaries

## Support

For issues or questions:
- Check the main documentation: `docs/ANALYTICS_FEATURE.md`
- Review API responses for error messages
- Check application logs for backend errors
- Verify database connectivity and migrations
