# Analytics Feature - Quick Reference Card

## 🚀 Quick Start

```bash
# Backend
cd backend
make migrate-up
make run

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 📍 URLs

- Dashboard Analytics: `http://localhost:5173/analytics`
- Personal Analytics: `http://localhost:5173/my-analytics`
- API Dashboard: `http://localhost:8080/api/v1/analytics/dashboard?days=30`
- API Personal: `http://localhost:8080/api/v1/analytics/me`

## 🔑 API Endpoints

### Get Dashboard Analytics
```bash
GET /api/v1/analytics/dashboard?days=30
Authorization: Bearer {token}
```

### Get User Analytics
```bash
GET /api/v1/analytics/me
Authorization: Bearer {token}
```

## 📊 Key Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| Task Completion Rate | (Completed / Total) × 100 | % of tasks finished |
| Success Rate | (Approved Bids / Total Bids) × 100 | Bid approval rate |
| On-Time Rate | (On-Time / Total Completed) × 100 | Timely delivery rate |
| Avg Completion Time | SUM(completion_time) / COUNT(tasks) | Mean hours to complete |

## 🗂️ File Structure

```
backend/
├── internal/
│   ├── models/analytics.go              # Data structures
│   ├── repository/analytics_repo.go     # Database queries
│   ├── services/analytics_service.go    # Business logic
│   └── handlers/analytics.go            # HTTP handlers
└── migrations/
    ├── 000006_add_analytics_indexes.up.sql
    └── 000006_add_analytics_indexes.down.sql

frontend/
├── src/
│   ├── services/analyticsService.ts     # API client
│   └── pages/
│       ├── Analytics.tsx                # Dashboard page
│       └── MyAnalytics.tsx              # Personal page
```

## 🎨 Components

### Analytics.tsx
- Summary cards (4)
- Task trends chart (Line)
- Priority distribution (Doughnut)
- Status distribution (Doughnut)
- Skill demand chart (Bar)
- Top bidders table
- Top task owners table

### MyAnalytics.tsx
- Performance score card
- Stats grid (4 cards)
- Owner metrics
- Bidder metrics
- Performance insights

## 🔧 Configuration

### Time Ranges
- 7 days
- 30 days (default)
- 90 days
- 365 days

### Result Limits
- Top bidders: 10
- Top task owners: 10
- Skill demands: 10

## 📦 Dependencies

### Backend
```go
// No new dependencies - uses existing packages
```

### Frontend
```json
{
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

## 🗄️ Database Indexes

```sql
-- Performance indexes
idx_tasks_status
idx_tasks_priority
idx_tasks_owner_id
idx_tasks_assigned_to
idx_tasks_created_at
idx_tasks_updated_at
idx_bids_status
idx_bids_bidder_id
idx_bids_task_id
idx_tasks_completed_deadline
idx_bids_approved
```

## 🧪 Testing

### Test API Endpoints
```bash
# Dashboard analytics
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/analytics/dashboard?days=30

# User analytics
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/analytics/me
```

### Expected Response Structure
```json
{
  "status": "success",
  "message": "Analytics retrieved successfully",
  "data": {
    "summary": { /* metrics */ },
    "task_trends": [ /* array */ ],
    "top_bidders": [ /* array */ ],
    "top_task_owners": [ /* array */ ],
    "skill_demands": [ /* array */ ],
    "generated_at": "2024-01-15T10:30:00Z"
  }
}
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No data showing | Create tasks and bids first |
| Charts not rendering | Run `npm install` |
| Slow queries | Check indexes with `\d+ tasks` |
| 401 Unauthorized | Verify JWT token |

## 💡 Tips

1. **Performance**: Use shorter time ranges for faster queries
2. **Testing**: Create sample data for realistic charts
3. **Caching**: Consider Redis for frequently accessed data
4. **Export**: Add PDF/CSV export for reports
5. **Real-time**: Implement WebSocket for live updates

## 🎯 Performance Scores

| Score | Rating | Color |
|-------|--------|-------|
| ≥ 80% | Excellent | Green |
| 60-79% | Good | Blue |
| 40-59% | Fair | Yellow |
| < 40% | Needs Work | Red |

## 📈 Chart Types

| Chart | Library | Use Case |
|-------|---------|----------|
| Line | Chart.js | Trends over time |
| Doughnut | Chart.js | Distribution/proportions |
| Bar | Chart.js | Comparisons |

## 🔐 Security

- ✅ Authentication required
- ✅ User can only see own detailed analytics
- ✅ Platform analytics are aggregated
- ✅ No PII in public metrics
- ✅ SQL injection protected (parameterized queries)

## 📚 Documentation

- Full docs: `docs/ANALYTICS_FEATURE.md`
- Setup guide: `docs/ANALYTICS_SETUP_GUIDE.md`
- UI preview: `docs/ANALYTICS_UI_PREVIEW.md`
- Summary: `ANALYTICS_IMPLEMENTATION_SUMMARY.md`

## 🚦 Status Checklist

- [x] Backend models created
- [x] Repository layer implemented
- [x] Service layer implemented
- [x] Handler layer implemented
- [x] Routes registered
- [x] Migrations created
- [x] Frontend service created
- [x] Dashboard page created
- [x] Personal page created
- [x] Routes configured
- [x] Navigation updated
- [x] Dependencies listed
- [ ] Run `npm install`
- [ ] Run migrations
- [ ] Test endpoints
- [ ] Verify UI

## 🎉 Next Steps

1. Install frontend dependencies: `npm install`
2. Run database migrations: `make migrate-up`
3. Start backend: `make run`
4. Start frontend: `npm run dev`
5. Navigate to `/analytics`
6. Create sample data if needed
7. Explore the dashboard!

## 📞 Support

- Check logs: Backend console and browser DevTools
- Verify database: `psql -d taskdb -c "SELECT COUNT(*) FROM tasks;"`
- Test API: Use curl or Postman
- Review docs: See documentation files above
