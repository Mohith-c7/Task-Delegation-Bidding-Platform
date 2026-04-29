# FINAL PROJECT REPORT DRAFT

Note: This file contains the matter/content for the final project report. Formatting such as A4 page size, margins, Times New Roman font, page numbers, cover binding, and spacing should be applied later in the final Word/PDF document as per VIT-AP guidelines.

---

# 1. COVER PAGE

A project report on

A WEB-BASED PLATFORM FOR TASK SHARING AND WORKLOAD OPTIMIZATION

Submitted in partial fulfillment for the award of the degree of

Bachelor of Technology

in

Computer Science and Engineering

by

NAME OF THE CANDIDATE (REG. NO.)

School of Computer Science and Engineering

Vellore Institute of Technology, Andhra Pradesh

Amaravati

Month, Year

---

# 2. TITLE PAGE

A WEB-BASED PLATFORM FOR TASK SHARING AND WORKLOAD OPTIMIZATION

Submitted in partial fulfillment for the award of the degree of

Bachelor of Technology

in

Computer Science and Engineering

by

NAME OF THE CANDIDATE (REG. NO.)

Under the guidance of

GUIDE NAME

Designation, School of Computer Science and Engineering

Vellore Institute of Technology, Andhra Pradesh

Amaravati

Month, Year

---

# 3. DECLARATION BY THE CANDIDATE

DECLARATION

I hereby declare that the project report entitled "A Web-Based Platform for Task Sharing and Workload Optimization" submitted by me for the award of the degree of Bachelor of Technology at Vellore Institute of Technology, Andhra Pradesh, is a record of bonafide work carried out by me under the supervision of GUIDE NAME.

I further declare that the work reported in this project has not been submitted and will not be submitted, either in part or in full, for the award of any other degree or diploma in this institute or any other institute or university.

Place: Amaravati

Date:

Signature of the Candidate

NAME OF THE CANDIDATE

---

# 4. CERTIFICATE

CERTIFICATE

This is to certify that the Senior Design Project titled "A Web-Based Platform for Task Sharing and Workload Optimization" that is being submitted by NAME OF THE CANDIDATE (REG. NO.) is in partial fulfillment of the requirements for the award of Bachelor of Technology in Computer Science and Engineering. It is a record of bonafide work done under my guidance. The contents of this project work, in full or in parts, have neither been taken from any other source nor have been submitted to any other institute or university for the award of any degree or diploma, and the same is certified.

Guide Name

Guide

The thesis is satisfactory / unsatisfactory.

Internal Examiner

External Examiner

Approved by

Program Chair

Dean

School of Computer Science and Engineering

---

# 5. CERTIFICATE BY EXTERNAL GUIDE

Note: This section is applicable only if the project was carried out outside VIT under an external guide. If the project was completed within VIT, this page can be marked "Not Applicable" or removed according to the department instructions.

CERTIFICATE BY EXTERNAL GUIDE

This is to certify that the Senior Design Project titled "A Web-Based Platform for Task Sharing and Workload Optimization" submitted by NAME OF THE CANDIDATE (REG. NO.) was carried out under my external supervision at ORGANIZATION NAME, from START DATE to END DATE. The work completed by the candidate is original and relevant to the objectives of the project.

External Guide Name

Designation

Organization

Signature

Date

---

# 6. ABSTRACT

Modern software organizations depend on continuous collaboration, timely task completion, and efficient utilization of team members' skills. However, software teams frequently face disruptions caused by employee unavailability, illness, workload imbalance, emergency leave, or changing project priorities. In such situations, tasks assigned to one employee may remain blocked even when other qualified team members are available to help. Traditional task management systems support task creation, assignment, and tracking, but they generally do not provide a structured internal marketplace where unavailable employees can delegate work, interested employees can bid for tasks, and managers or task owners can approve suitable contributors.

The project "A Web-Based Platform for Task Sharing and Workload Optimization" addresses this problem by developing a web-based platform that enables employees in an organization to post tasks for delegation, view available tasks, place bids with estimated completion dates and proposal messages, approve or reject bids, track task progress, receive notifications, and analyze platform performance. The system is designed as a full-stack application using React, TypeScript, Vite, Tailwind CSS, and reusable UI components on the frontend, and Go, Gin, PostgreSQL, Redis, JWT authentication, and layered backend architecture on the server side.

The system supports user authentication, task posting, task search and filtering, bidding, bid approval and rejection, task assignment, task status transitions, comments, checklist updates, analytics dashboards, personal performance analytics, email and OTP planning, notification infrastructure, organization support, billing groundwork, and an extended user profile. The user profile feature includes identity information, bio, avatar, skills, resume link, total points, average rating, task history, bid history, notification preferences, password settings, and a public profile view. The analytics module provides platform metrics such as total tasks, open tasks, completed tasks, total bids, completion rate, top bidders, top task owners, priority distribution, status distribution, task trends, and skill demand.

The project follows a modular architecture with clearly separated models, repositories, services, handlers, middleware, frontend pages, API services, state management, and design-system components. The backend uses PostgreSQL for persistent data storage, Redis for token and notification-related workflows, and JWT for secure access control. The frontend provides a responsive user interface with dashboards, cards, tables, modals, forms, status badges, analytics charts, and navigation flows suitable for modern web applications.

The project demonstrates how an internal task delegation platform can improve workflow continuity, increase transparency in task handover, promote skill-based task allocation, and support data-driven management decisions. It also identifies future enhancements such as manager review queues, task lifecycle timelines, completion evidence, dispute handling, bid ranking scores, availability calendars, workload dashboards, organization invite flows, real-time notifications, Swagger documentation, and service-layer unit testing.

---

# 7. ACKNOWLEDGEMENT

ACKNOWLEDGEMENT

I express my sincere gratitude to GUIDE NAME, DESIGNATION, School of Computer Science and Engineering, Vellore Institute of Technology, Andhra Pradesh, for the constant guidance, valuable suggestions, encouragement, and support provided throughout the course of this Senior Design Project. The guidance received helped me understand the importance of systematic requirement analysis, software architecture, implementation discipline, testing, documentation, and presentation of engineering work.

I would like to express my gratitude to the Chancellor, Vice Presidents, Vice Chancellor, Dean, Program Chair, faculty members, and staff of Vellore Institute of Technology, Andhra Pradesh, for providing a supportive academic environment and the required facilities to complete this project successfully.

I am also thankful to my parents for their continuous encouragement, patience, and support. I extend my thanks to my friends and classmates who provided useful feedback during the design, development, and review stages of the project.

Finally, I express my appreciation to everyone who directly or indirectly helped me complete this project.

Place: Amaravati

Date:

NAME OF THE CANDIDATE

---

# 8. TABLE OF CONTENTS

1. Cover Page
2. Title Page
3. Declaration by the Candidate
4. Certificate
5. Certificate by External Guide
6. Abstract
7. Acknowledgement
8. Table of Contents
9. List of Tables
10. List of Figures
11. List of Symbols, Abbreviations and Nomenclature
12. Chapters of the Report
    - Chapter 1: Introduction
    - Chapter 2: Background and Literature Survey
    - Chapter 3: Requirement Analysis
    - Chapter 4: System Analysis and Design
    - Chapter 5: Implementation
    - Chapter 6: Testing and Validation
    - Chapter 7: Results and Discussion
    - Chapter 8: Project Management and Deployment
13. Conclusion and Future Work
14. References
15. Appendices

---

# 9. LIST OF TABLES

Table 1.1 User classes and responsibilities

Table 1.2 Project objectives and expected outcomes

Table 2.1 Comparison of existing task management platforms

Table 3.1 Functional requirements

Table 3.2 Non-functional requirements

Table 3.3 System constraints and assumptions

Table 4.1 Backend architectural layers

Table 4.2 Frontend architectural modules

Table 4.3 Database entities and purpose

Table 5.1 API endpoint summary

Table 5.2 Frontend page summary

Table 5.3 User profile feature mapping

Table 6.1 Test case summary

Table 6.2 Validation checklist

Table 7.1 SRS compliance matrix

Table 8.1 Development tools and technologies

Table 13.1 Future enhancement roadmap

---

# 10. LIST OF FIGURES

Figure 1.1 Problem scenario in conventional task assignment

Figure 1.2 Proposed task delegation marketplace workflow

Figure 4.1 High-level system architecture

Figure 4.2 Backend layered architecture

Figure 4.3 Frontend component architecture

Figure 4.4 Database relationship model

Figure 4.5 Authentication and authorization flow

Figure 4.6 Task bidding and approval flow

Figure 5.1 Dashboard user interface

Figure 5.2 Task card and bid interaction

Figure 5.3 Analytics dashboard view

Figure 5.4 User profile page structure

Figure 5.5 Notification flow

Figure 8.1 Deployment architecture

Figure 13.1 Future roadmap timeline

---

# 11. LIST OF SYMBOLS, ABBREVIATIONS AND NOMENCLATURE

API: Application Programming Interface

CRUD: Create, Read, Update, Delete

DB: Database

ETA: Estimated Time of Arrival / Estimated Completion Time

FR: Functional Requirement

HTTP: Hypertext Transfer Protocol

JWT: JSON Web Token

NFR: Non-Functional Requirement

OTP: One-Time Password

RBAC: Role-Based Access Control

REST: Representational State Transfer

SRS: Software Requirements Specification

SSE: Server-Sent Events

SQL: Structured Query Language

UI: User Interface

UX: User Experience

VCS: Version Control System

Vite: Frontend build tool used for React development

PostgreSQL: Relational database used for persistent storage

Redis: In-memory data store used for caching, token support, and notification workflows

Gin: Go web framework used for backend routing and middleware

React: Frontend library used for building user interfaces

TypeScript: Typed superset of JavaScript used in the frontend

---

# 12. CHAPTERS OF THE REPORT

# CHAPTER 1: INTRODUCTION

## 1.1 INTRODUCTION

Software teams depend on coordinated task execution. In a typical organization, each employee is assigned tasks based on role, availability, expertise, sprint planning, or managerial allocation. However, employee availability is not always predictable. A developer may become unavailable due to illness, emergency leave, workload pressure, skill mismatch, or higher-priority work. When this happens, the task assigned to that employee may remain pending even though other team members possess the skills needed to complete it.

Existing task management systems provide features such as task creation, assignment, due dates, comments, and status tracking. However, they usually follow a top-down assignment model. In such systems, when a person becomes unavailable, a manager has to manually identify another suitable person, communicate the task details, confirm availability, and reassign the task. This process is time-consuming and lacks transparency. It may also create unfair workload distribution because available team members are not always visible to the manager.

The proposed project introduces a structured web-based platform for task sharing and workload optimization. The platform allows a task owner to post a task for delegation. Other employees can view the task, understand the required skills, and place bids by explaining their approach and estimated completion date. The task owner or manager can review the bids, approve a suitable bidder, and the approved bidder becomes the temporary assignee. The system tracks task status, stores bid history, provides analytics, sends notifications, and maintains user performance data.

The project is especially useful for software teams because software tasks often require specific skills such as React, TypeScript, Go, PostgreSQL, DevOps, Machine Learning, UI/UX, or security testing. By allowing employees to bid for tasks based on their skills, the platform improves task continuity and enables better utilization of organizational talent.

## 1.2 PROBLEM STATEMENT

In software organizations, task delays occur when assigned employees become unavailable or overloaded. Existing tools do not provide a complete internal marketplace where tasks can be delegated transparently, employees can express interest through bids, managers can approve suitable contributors, and performance can be measured through analytics and user profiles.

The problem can be summarized as follows:

- Task reassignment is often manual and inefficient.
- Managers may not know which team members are available or skilled enough.
- Employees do not have a structured way to volunteer for delegated tasks.
- Task ownership, bidding, approval, and progress tracking are not combined in one workflow.
- Performance data such as bid success rate, completed tasks, rating, and skills are not easily available.
- Notifications and reminders are required to prevent missed deadlines.
- Organizations need analytics to measure task flow, completion rate, and team productivity.

## 1.3 OBJECTIVES

The main objectives of the project are:

1. To design and develop a web-based platform for task delegation within software teams.
2. To allow authenticated users to create tasks with title, description, required skills, priority, deadline, and questionnaire items.
3. To allow other users to view available tasks and place bids with proposal messages, estimated completion dates, and answers to task-specific questions.
4. To allow task owners to view, approve, or reject bids.
5. To automatically assign a task to the approved bidder and update task status.
6. To provide task progress tracking through statuses such as open, assigned, in progress, completed, and closed.
7. To support analytics dashboards for platform-wide and personal performance metrics.
8. To create a comprehensive user profile showing name, role, skills, resume, ratings, points, tasks applied, tasks accepted, task history, bid history, and customer reviews.
9. To provide notification support for important task and bid events.
10. To design a modular and maintainable architecture using modern full-stack technologies.

## 1.4 SCOPE OF THE PROJECT

The project is scoped as an internal organizational platform for software teams. It covers authentication, task posting, task browsing, task filtering, bidding, approval, assignment, progress tracking, analytics, notifications, organization-level support, and user profiles.

The system is not intended to replace large enterprise project management platforms such as Jira or Asana. Instead, it complements such systems by adding a delegation and bidding layer for temporary task transfer. It is particularly useful in cases where an employee is unavailable and another team member can temporarily take over the task.

The current project includes:

- Backend API development using Go and Gin.
- PostgreSQL database schema and migrations.
- Redis-supported authentication and notification workflows.
- React and TypeScript frontend.
- Authentication and JWT-based protected routes.
- Task marketplace dashboard.
- Bidding and bid approval workflows.
- Analytics dashboard.
- Personal analytics.
- User profile and public profile groundwork.
- Notification infrastructure.
- Organization and membership support.
- Future roadmap for advanced workflow features.

## 1.5 USER CLASSES

Table 1.1 User classes and responsibilities

| User Class | Responsibilities |
| --- | --- |
| Task Owner | Creates tasks, views bids, approves/rejects bids, reviews task completion, rates assignee |
| Bidder | Views open tasks, places bids, completes assigned tasks, updates progress |
| Manager | Monitors tasks, approves workflow where required, reviews pending or overdue work |
| Organization Admin | Manages organization, members, roles, invitations, billing settings |
| System Admin | Maintains platform configuration, system-level access, security, deployment |

## 1.6 SIGNIFICANCE OF THE PROJECT

The project is significant because it addresses a practical workplace problem using a full-stack engineering solution. It combines concepts from software engineering, database design, web application development, authentication, workflow management, analytics, and user experience design. It also demonstrates how academic software engineering principles can be applied to a realistic organizational use case.

The platform improves:

- Continuity of software work during employee unavailability.
- Transparency in task delegation.
- Skill-based assignment.
- Bidder accountability.
- Managerial visibility.
- Employee performance tracking.
- Data-driven decision-making.

# CHAPTER 2: BACKGROUND AND LITERATURE SURVEY

## 2.1 BACKGROUND

Task management has evolved from simple to-do lists to collaborative digital platforms. Modern teams use tools such as Jira, Trello, Asana, Monday.com, Linear, ClickUp, and GitHub Issues to plan, assign, and track work. These systems provide useful features such as boards, statuses, comments, labels, priorities, due dates, and reports.

However, most systems assume that a task is assigned directly by a manager or project lead. They do not usually provide a bidding mechanism where employees can compete or volunteer for tasks based on skill and availability. In software teams, such a feature can be valuable because many tasks require specialized technical expertise and may be suitable for multiple team members.

The project combines task management with a marketplace-style bidding system. The term marketplace here does not refer to public freelancing. Instead, it refers to an internal organization-level workflow where employees can view delegated tasks and offer to take them up.

## 2.2 SURVEY OF EXISTING SYSTEMS

Trello is known for its Kanban-style visual simplicity. It allows users to move cards across lists such as To Do, Doing, and Done. However, Trello does not provide built-in task bidding or approval-based temporary reassignment.

Asana provides structured project management with tasks, dependencies, teams, and timelines. It supports collaboration and reporting but does not include a bidding layer for internal delegation.

Jira is widely used in software engineering teams for issue tracking and sprint planning. It supports workflows, statuses, assignees, comments, and reporting. However, Jira task reassignment is generally manual and does not allow employees to bid with an ETA and proposal.

Monday.com provides visual project boards and workflow automation. It is flexible but does not focus specifically on task delegation caused by employee unavailability.

Linear provides a fast engineering-focused issue tracking experience. It is suitable for software teams but does not include a task marketplace model.

GitHub Issues supports software task tracking tied to repositories. It allows assignment and labels but does not provide structured bidding, approval, or performance scoring.

## 2.3 RESEARCH INSIGHTS FROM UI/UX STUDY

The UI/UX research documentation for the project identifies important modern design principles:

- Interfaces should be simple, clear, and fast.
- Task management products benefit from card-based layouts, status badges, compact data views, and contextual actions.
- Progressive disclosure helps reduce clutter by showing additional controls only when needed.
- Visual hierarchy is important for priorities, deadlines, and status changes.
- Responsive design is required because users may access the platform from desktops, tablets, or mobile devices.
- Micro-interactions, loading states, empty states, and error states improve user trust.
- Dashboards should support quick scanning and repeated daily use.

These insights influenced the use of reusable UI components, task cards, filters, status badges, analytics charts, modal dialogs, tabbed profile pages, and dashboard sections.

## 2.4 GAP IN EXISTING SYSTEMS

The main gap identified is the absence of a structured internal delegation workflow. Existing systems track tasks after assignment, but they do not provide a process where:

- A task owner posts a task for temporary delegation.
- Interested employees place bids.
- Bids contain an approach and estimated completion time.
- The owner or manager selects the best bidder.
- The task is automatically assigned after approval.
- Performance metrics are updated based on completion and rating.

The proposed system fills this gap by combining task management, bidding, approval, analytics, notifications, and user profile-based reputation.

# CHAPTER 3: REQUIREMENT ANALYSIS

## 3.1 FUNCTIONAL REQUIREMENTS

Table 3.1 Functional requirements

| ID | Requirement | Description |
| --- | --- | --- |
| FR1 | User Authentication | Users must register, log in, refresh tokens, and access protected routes using JWT authentication. |
| FR2 | Task Posting | Users must be able to create tasks with title, description, skills, deadline, priority, and optional questions. |
| FR3 | Task Viewing | Users must be able to view open tasks and filter tasks by status, priority, skills, deadline, and search query. |
| FR4 | Bidding | Users must be able to place bids with proposal message, estimated completion, and answers to task questions. |
| FR5 | Bid Management | Task owners must be able to view bids and approve or reject them. |
| FR6 | Task Assignment | Approved bidder must automatically become the task assignee. |
| FR7 | Progress Tracking | Task status must support workflow stages such as open, assigned, in progress, completed, and closed. |
| FR8 | Task Completion and Review | Task owners must be able to rate completed tasks and assign points. |
| FR9 | Notifications | Users must receive in-app and planned email notifications for important events. |
| FR10 | Admin and Organization Control | Organization admins must manage members, roles, invitations, subscriptions, and audit logs. |
| FR11 | Analytics Dashboard | The system must provide platform-wide and personal analytics. |
| FR12 | User Profile | Users must have private and public profile pages with identity, role, skills, resume, stats, histories, ratings, and reviews. |
| FR13 | Search and Recommendations | The system must support skill-based recommendations and dashboard search. |
| FR14 | Kanban View | Tasks must be viewable in a status-based Kanban layout. |

## 3.2 NON-FUNCTIONAL REQUIREMENTS

Table 3.2 Non-functional requirements

| ID | Requirement | Description |
| --- | --- | --- |
| NFR1 | Performance | Common API requests should respond within acceptable time under normal load. |
| NFR2 | Security | Authentication, protected routes, password hashing, JWT validation, and role checks must be applied. |
| NFR3 | Scalability | The architecture should support future organization-level and team-level growth. |
| NFR4 | Maintainability | Code should be modular with separated models, repositories, services, handlers, and frontend services. |
| NFR5 | Usability | The UI should be responsive, clear, and easy to use. |
| NFR6 | Reliability | The application should handle errors, empty states, and invalid requests gracefully. |
| NFR7 | Extensibility | The system should allow future features such as review queue, real-time notifications, and task evidence. |
| NFR8 | Data Integrity | Duplicate bids, invalid task transitions, unauthorized updates, and duplicate reviews must be prevented. |

## 3.3 SYSTEM CONSTRAINTS

The project is constrained by the academic timeline and scope of a senior design project. It uses open-source frameworks and services suitable for web deployment. The backend is built with Go and Gin, while the frontend is built with React and TypeScript. PostgreSQL is used for structured data and Redis is used for workflows that benefit from fast key-value operations.

The report assumes deployment through cloud-friendly configuration such as Docker and Render, with environment variables for database URL, Redis URL, JWT secret, token expiry, allowed origins, and production mode.

## 3.4 ASSUMPTIONS

- Users belong to the same organization or controlled organizational environment.
- Tasks are primarily software-related.
- Users have sufficient technical skills to bid for tasks.
- Task owners or managers have authority to approve delegation.
- The system can be extended to multiple organizations.
- Users have access to a modern browser.
- Database and Redis services are available in deployment.

## 3.5 EDGE CASES CONSIDERED

Important edge cases include:

- User tries to bid on their own task.
- User places duplicate bid on the same task.
- Task is not open but user tries to bid.
- Non-owner tries to approve or reject a bid.
- Task owner approves one bid and other pending bids should be rejected.
- User attempts invalid status transition.
- User tries to rate an unassigned or incomplete task.
- User tries to rate the same task twice.
- Public profile must not reveal private email or bid history.
- Missing avatar should show initials.
- Empty task list should show useful empty state.
- API failure should show error state.
- Expired tokens should refresh or log out cleanly.
- Unauthorized access should return proper error.

# CHAPTER 4: SYSTEM ANALYSIS AND DESIGN

## 4.1 SYSTEM ARCHITECTURE

The system follows a client-server architecture. The frontend runs in the browser and communicates with the backend through REST API calls. The backend manages business logic, authentication, validation, database operations, notifications, and analytics. PostgreSQL stores persistent application data, while Redis supports caching, rate limiting, token-related workflows, OTP support, and notification streaming.

High-level architecture:

1. Client Layer: React, TypeScript, Vite, Tailwind CSS.
2. API Layer: Go, Gin framework, REST endpoints.
3. Business Logic Layer: Services for authentication, tasks, bids, analytics, organizations, notifications, OTP, email, and billing.
4. Data Access Layer: Repository classes using PostgreSQL queries.
5. Data Layer: PostgreSQL and Redis.
6. Deployment Layer: Docker and cloud environment variables.

## 4.2 BACKEND ARCHITECTURE

Table 4.1 Backend architectural layers

| Layer | Responsibility | Example Files |
| --- | --- | --- |
| Config | Loads environment variables | `config.go`, `smtp.go` |
| Models | Defines domain data structures | `user.go`, `task.go`, `bid.go`, `analytics.go` |
| Repository | Handles database queries | `task_repo.go`, `bid_repo.go`, `user_repo.go` |
| Service | Implements business logic | `task_service.go`, `bid_service.go`, `auth_service.go` |
| Handler | Handles HTTP requests and responses | `task.go`, `bid.go`, `auth.go` |
| Middleware | Authentication, CORS, rate limiting, RBAC | `auth.go`, `cors.go`, `ratelimit.go`, `rbac.go` |
| Utilities | JWT, password hashing, responses, email templates | `jwt.go`, `password.go`, `response.go` |

The layered backend architecture improves maintainability. Handlers do not directly execute SQL queries. Instead, they call services, and services call repositories. This separation makes the system easier to test and extend.

## 4.3 FRONTEND ARCHITECTURE

Table 4.2 Frontend architectural modules

| Module | Responsibility |
| --- | --- |
| Pages | Main screens such as Dashboard, Analytics, Profile, My Tasks, My Bids |
| Components | Reusable components such as TaskCard, modals, Sidebar, Layout |
| Services | API communication using Axios |
| Store | Authentication state using Zustand |
| Design System | Buttons, Cards, Inputs, Badges, Toasts, Modals |
| Routing | Protected routes using React Router |

The frontend uses React components and TypeScript interfaces to ensure maintainability and type safety. API calls are placed in service files such as `taskService.ts`, `bidService.ts`, `authService.ts`, and `analyticsService.ts`.

## 4.4 DATABASE DESIGN

The database is designed around the following major entities:

Table 4.3 Database entities and purpose

| Entity | Purpose |
| --- | --- |
| users | Stores user identity, authentication details, skills, profile fields, points, and rating data |
| tasks | Stores task details, owner, assignee, priority, status, deadline, questions, rating, and points |
| bids | Stores bidder proposals, estimated completion, status, answers, and approval data |
| organizations | Stores organization-level data |
| memberships | Maps users to organizations and roles |
| invitations | Stores organization invitation tokens and statuses |
| notifications | Stores in-app notification data |
| activity_feed | Stores task lifecycle events |
| comments | Stores task comments |
| checklist_items | Stores task checklist progress |
| subscriptions | Stores organization billing tier data |
| audit_log | Stores organization audit events |
| user_reviews | Proposed table for customer/task-owner reviews |

## 4.5 AUTHENTICATION DESIGN

The authentication system uses JWT-based access tokens and refresh tokens. Passwords are hashed before storage. Protected API routes require a valid bearer token. The frontend stores tokens in local storage and attaches them to API requests through an Axios interceptor. When an access token expires, the frontend attempts to refresh it using the refresh token.

The authentication design includes:

- User registration.
- User login.
- JWT access token generation.
- Refresh token generation.
- Token validation middleware.
- Password hashing.
- Password change endpoint.
- Planned email verification and OTP flows.

## 4.6 TASK DELEGATION WORKFLOW

The task delegation workflow is:

1. A user logs in.
2. The user creates a task with title, description, skills, deadline, and priority.
3. Other users view open tasks on the dashboard.
4. A bidder opens the bid modal and submits a proposal with ETA.
5. The task owner views all bids.
6. The task owner approves one bid or rejects bids.
7. The approved bid changes the task status to assigned.
8. The approved bidder becomes the assignee.
9. The task progresses through status transitions.
10. The owner rates the completed task and assigns points.

## 4.7 ANALYTICS DESIGN

The analytics module provides:

- Summary metrics.
- Task trend chart.
- Priority distribution.
- Status distribution.
- Skill demand.
- Top bidders.
- Top task owners.
- Personal performance score.
- User-level task and bid metrics.

The backend performs aggregation using SQL queries and the frontend renders visualizations using Chart.js and React Chart.js components.

## 4.8 USER PROFILE DESIGN

The full user profile is designed as both a private and public view.

Private profile includes:

- Name.
- Email.
- Role.
- Avatar.
- Bio.
- Skills.
- Resume URL.
- Member since.
- Total points.
- Average rating.
- Tasks applied.
- Tasks accepted.
- Tasks posted.
- Tasks completed.
- Bids placed.
- Bids won.
- Success rate.
- Task history.
- Bid history.
- Reviews by task owners/customers.
- Notification settings.
- Password change.

Public profile includes:

- Name.
- Role.
- Avatar.
- Bio.
- Skills.
- Resume link.
- Overall rating.
- Tasks accepted.
- Tasks completed.
- Customer reviews.

Public profile excludes:

- Email.
- Password settings.
- Notification settings.
- Private bid history.

# CHAPTER 5: IMPLEMENTATION

## 5.1 TECHNOLOGY STACK

Table 5.1 Technology stack

| Area | Technology |
| --- | --- |
| Frontend Framework | React 18 |
| Frontend Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| HTTP Client | Axios |
| Charts | Chart.js, React Chart.js |
| Backend Language | Go |
| Backend Framework | Gin |
| Database | PostgreSQL |
| Cache / Key-Value Store | Redis |
| Authentication | JWT |
| Password Security | bcrypt through Go crypto libraries |
| Deployment | Docker, Render configuration |
| Version Control | Git and GitHub |

## 5.2 BACKEND IMPLEMENTATION

The backend is implemented in Go using the Gin web framework. The main entry point initializes configuration, PostgreSQL connection, Redis connection, repositories, services, handlers, middleware, routes, and the HTTP server.

The backend modules include:

- Authentication service for registration, login, token generation, password change, reset-token planning, and user profile access.
- Task service for task creation, update, delete, search, status transition, checklist, comments, task detail, and rating.
- Bid service for bid creation, duplicate prevention, bid approval, bid rejection, task assignment, notification, and email integration.
- Analytics service for platform and personal metrics.
- Organization service for organizations, memberships, invitations, onboarding, audit log, and role handling.
- Notification service for storing and streaming notification events.
- OTP service and email service groundwork.
- Billing service groundwork for subscription tiers and task limits.

## 5.3 FRONTEND IMPLEMENTATION

The frontend is implemented using React and TypeScript. The application uses React Router for navigation and protected routes. Authentication state is managed using Zustand. API communication is handled through Axios service files.

Major frontend pages include:

- Login.
- Register.
- Dashboard.
- My Tasks.
- My Bids.
- Analytics.
- My Analytics.
- Task Detail.
- Organization Settings.
- Profile.
- Public Profile.
- Leaderboard.
- Notifications.
- Onboarding.

The dashboard supports task cards, filters, search, recommended tasks, and Kanban view. Task actions include creating a task, placing a bid, viewing bids, and deleting owned tasks. The analytics pages present charts and tables for platform-wide and user-specific performance.

## 5.4 API ENDPOINT SUMMARY

Table 5.2 API endpoint summary

| Category | Endpoint | Method | Purpose |
| --- | --- | --- | --- |
| Health | `/health` | GET | Checks API status |
| Auth | `/api/v1/auth/register` | POST | Registers a user |
| Auth | `/api/v1/auth/login` | POST | Logs in user |
| Auth | `/api/v1/auth/refresh` | POST | Refreshes access token |
| Auth | `/api/v1/auth/logout` | POST | Logs out user |
| User | `/api/v1/users/me` | GET | Gets authenticated user |
| User | `/api/v1/users/me` | PUT | Updates profile |
| User | `/api/v1/users/me/profile` | GET | Gets private full profile |
| User | `/api/v1/users/:id/profile` | GET | Gets public profile |
| User | `/api/v1/users/me/password` | PUT | Changes password |
| User | `/api/v1/users/me/notifications` | PUT | Updates notification preferences |
| Tasks | `/api/v1/tasks` | GET | Lists/searches tasks |
| Tasks | `/api/v1/tasks` | POST | Creates task |
| Tasks | `/api/v1/tasks/my` | GET | Gets owned tasks |
| Tasks | `/api/v1/tasks/:id` | GET | Gets task detail |
| Tasks | `/api/v1/tasks/:id` | PUT | Updates task |
| Tasks | `/api/v1/tasks/:id` | DELETE | Deletes task |
| Tasks | `/api/v1/tasks/:id/status` | PATCH | Changes task status |
| Tasks | `/api/v1/tasks/:id/comments` | POST | Adds comment |
| Tasks | `/api/v1/tasks/:id/checklist` | PUT | Updates checklist |
| Tasks | `/api/v1/tasks/:id/rate` | POST | Rates completed task |
| Bids | `/api/v1/tasks/:id/bids` | POST | Places bid |
| Bids | `/api/v1/tasks/:id/bids` | GET | Gets bids for task |
| Bids | `/api/v1/bids/my` | GET | Gets user's bids |
| Bids | `/api/v1/bids/:id/approve` | PATCH | Approves bid |
| Bids | `/api/v1/bids/:id/reject` | PATCH | Rejects bid |
| Analytics | `/api/v1/analytics/dashboard` | GET | Gets dashboard analytics |
| Analytics | `/api/v1/analytics/me` | GET | Gets personal analytics |
| Notifications | `/api/v1/notifications` | GET | Lists notifications |
| Notifications | `/api/v1/notifications/stream` | GET | Streams notifications |
| Organizations | `/api/v1/orgs` | POST | Creates organization |
| Organizations | `/api/v1/orgs/:id/members` | GET | Lists members |
| Organizations | `/api/v1/orgs/:id/invitations` | POST | Sends invitation |
| Leaderboard | `/api/v1/leaderboard` | GET | Gets top users by points |

## 5.5 USER PROFILE IMPLEMENTATION

The user profile implementation extends the basic user account into a complete credibility and performance view. The backend stores profile fields such as bio, avatar URL, skills, resume URL, total points, rating sum, and rating count. The repository fetches task history and bid history. The service exposes profile data through private and public endpoints.

The frontend profile page is structured around a hero card and tabs. The hero card shows avatar, name, email for private profile, bio, skills, rating, success rate, and points. The overview tab shows statistics. The task history tab lists tasks posted by the user. The bid history tab lists tasks on which the user has placed bids. Settings allow editing of name, avatar, bio, resume URL, and skills. Password and notification tabs support account management.

The next planned extension is customer/task-owner reviews. Reviews will allow completed task owners to provide ratings and comments for assignees, improving trust and reputation.

## 5.6 ANALYTICS IMPLEMENTATION

The analytics module contains backend models, repository queries, service methods, and handlers. The repository uses SQL aggregation to calculate metrics such as total tasks, open tasks, completed tasks, total bids, completion rates, priority distribution, status distribution, skill demand, top bidders, and top task owners.

The frontend analytics page uses charts and tables. Summary cards provide quick metrics. Line charts show task trends. Doughnut charts show priority and status distributions. Bar charts show skill demand. Performance tables rank bidders and task owners.

Personal analytics show user-specific statistics such as task completion rate, bid success rate, average completion time, on-time delivery, and performance score.

## 5.7 NOTIFICATION AND EMAIL IMPLEMENTATION

The notification infrastructure includes a notification model, repository, service, handler, database table, and streaming endpoint. Notifications are created for events such as bid placed, bid approved, bid rejected, task assigned, task updated, comments, and deadline reminders.

Email and OTP documentation describes planned and partially implemented flows:

- SMTP email service.
- Email verification.
- OTP authentication.
- Forgot password.
- Password reset.
- Event-based email notifications.
- Welcome emails.
- Bid approval and rejection emails.
- Deadline reminders.

Redis is used for workflows such as OTP and password reset token storage, where expiry is important.

## 5.8 ORGANIZATION AND ADMIN FEATURES

The project includes organization-level support. Organizations can be created, memberships can be managed, roles can be assigned, invitations can be sent, onboarding status can be updated, audit logs can be viewed, and billing subscription information can be maintained.

Roles include organization admin, manager, and employee. Middleware checks organization membership and required roles for sensitive routes.

## 5.9 UI/UX IMPLEMENTATION

The UI follows principles identified in the UI/UX research document. It uses:

- Card-based layouts.
- Status badges.
- Priority badges.
- Responsive grids.
- Modal dialogs.
- Toast messages.
- Empty states.
- Skeleton loading states.
- Sidebar navigation.
- Dashboard filters.
- Analytics charts.
- Profile tabs.
- Kanban columns.

The interface is designed for software team users who need to scan tasks, act quickly, and understand task status at a glance.

# CHAPTER 6: TESTING AND VALIDATION

## 6.1 TESTING STRATEGY

Testing was performed through a combination of build checks, backend compilation, API-level reasoning, manual verification, and feature review. The project currently includes limited automated test files, so the testing approach emphasizes compile-time validation, frontend production build, backend vet checks, and manual scenario testing.

The following checks were used during development:

- `go test ./...`
- `go vet ./...`
- `go build ./cmd/api`
- `npm run build`
- `npm audit --omit=dev`
- Git status and diff checks
- Manual review of routes and workflows

## 6.2 TEST CASE SUMMARY

Table 6.1 Test case summary

| Test Case | Expected Result |
| --- | --- |
| Register user | User account created and tokens returned |
| Login with valid credentials | Access and refresh tokens returned |
| Login with invalid credentials | Error returned |
| Create task | Task saved with owner ID |
| View tasks | List of tasks returned |
| Search tasks | Tasks filtered by search query |
| Filter tasks by status | Only selected status returned |
| Place bid on open task | Bid created |
| Bid on own task | Request rejected |
| Duplicate bid | Request rejected |
| Approve bid by owner | Bid approved, task assigned |
| Approve bid by non-owner | Request rejected |
| Reject bid | Bid status updated to rejected |
| Update task by owner | Task updated |
| Update task by non-owner | Request rejected |
| Delete task by owner | Task deleted |
| Invalid status transition | Request rejected |
| Rate completed task | Rating and points saved |
| Rate incomplete task | Request rejected |
| View analytics | Metrics returned |
| View profile | Profile data returned |
| Update profile | Profile fields saved |
| Update notification preferences | Preferences persisted |
| Public profile | Private fields hidden |

## 6.3 VALIDATION AGAINST REQUIREMENTS

Table 6.2 Validation checklist

| Requirement | Validation Status |
| --- | --- |
| Authentication | Implemented with JWT and protected routes |
| Task posting | Implemented |
| Task viewing | Implemented |
| Search/filter | Backend implemented, frontend support added and improving |
| Bidding | Implemented |
| Bid approval/rejection | Implemented |
| Task assignment | Implemented after bid approval |
| Progress tracking | Implemented through statuses |
| Analytics | Implemented |
| Notification infrastructure | Implemented, deadline reminder requires completion |
| Profile | Implemented and planned for review extension |
| Organization support | Implemented foundational support |
| Admin control | Partially implemented through organization roles |

## 6.4 KNOWN LIMITATIONS

The project has the following limitations:

- Automated unit test coverage is limited and should be expanded.
- Swagger/OpenAPI documentation is planned but not completed.
- Deadline reminder job requires full implementation and testing.
- Email notifications are partially wired and should be completed for all key events.
- Customer reviews require a dedicated review table and UI.
- Manager review queue and workload dashboard are planned for future work.
- Advanced dispute and revision workflows are not fully implemented.
- Public profile should be enhanced to show reviews and completed work.
- Linting requires a complete ESLint configuration.

# CHAPTER 7: RESULTS AND DISCUSSION

## 7.1 PROJECT OUTPUT

The project produced a full-stack web application for task delegation and bidding. The system allows users to register, log in, create tasks, view tasks, place bids, approve bids, assign tasks, track progress, view analytics, manage profiles, and receive notifications.

The backend compiles successfully and follows a modular architecture. The frontend production build succeeds after resolving compile-time issues. The system includes clear routing, database models, repository methods, services, handlers, middleware, and UI components.

## 7.2 SRS COMPLIANCE MATRIX

Table 7.1 SRS compliance matrix

| Functional Requirement | Status | Remarks |
| --- | --- | --- |
| FR1 User Authentication | Complete | JWT-based login and protected routes implemented |
| FR2 Task Posting | Complete | Users can create tasks |
| FR3 Task Viewing and Filtering | Mostly Complete | Backend search and filters implemented; frontend filter UI added |
| FR4 Bidding | Complete | Users can place bids |
| FR5 Bid Management | Complete | Owners can approve/reject bids |
| FR6 Task Assignment | Complete | Approved bidder assigned automatically |
| FR7 Progress Tracking | Complete | Status transitions implemented |
| FR8 Task Completion and Review | Partially Complete | Rating/points implemented; richer review flow planned |
| FR9 Notifications | Partially Complete | In-app infrastructure exists; reminder/email workflows need strengthening |
| FR10 Admin Control | Partially Complete | Organization roles and membership implemented |
| FR11 Analytics Dashboard | Complete | Dashboard and personal analytics implemented |
| FR12 User Profile | Mostly Complete | Profile core implemented; customer reviews planned |

## 7.3 BENEFITS OF THE SYSTEM

The system provides the following benefits:

- Reduces task delays caused by employee unavailability.
- Enables transparent task delegation.
- Encourages employees to take tasks matching their skills.
- Provides structured bid comparison.
- Improves accountability through ratings and points.
- Gives managers analytics for better decision-making.
- Helps employees build internal reputation.
- Supports future organization-level scaling.

## 7.4 DISCUSSION

The project demonstrates that a marketplace-inspired workflow can be useful inside a software organization. Instead of waiting for manual reassignment, employees can proactively bid for tasks. This creates a more dynamic and transparent environment. Analytics further improves management visibility by showing task completion trends, skill demand, and user performance.

The main challenge is maintaining data integrity and fair workflow rules. For example, a task should not have multiple approved bids, users should not bid on their own tasks, and reviews should only be allowed after actual task completion. These edge cases are important because they determine whether the platform can be trusted in a real organization.

The project also highlights the importance of user experience. A task delegation platform must not feel complicated. It should allow users to quickly identify relevant tasks, understand status, place bids, and act on notifications.

# CHAPTER 8: PROJECT MANAGEMENT AND DEPLOYMENT

## 8.1 DEVELOPMENT PROCESS

The project was developed incrementally. Initial work focused on project structure, authentication, task management, and bidding. Later phases added analytics, organization support, notification planning, profile features, leaderboard, recommendations, search filters, and Kanban view. Documentation was maintained for analytics, OTP/email planning, UI/UX research, restructuring, and future roadmap.

## 8.2 DEVELOPMENT TOOLS

Table 8.1 Development tools and technologies

| Tool | Purpose |
| --- | --- |
| Git | Version control |
| GitHub | Remote repository |
| VS Code / Editor | Development environment |
| Go | Backend programming |
| Node.js / npm | Frontend dependency management |
| PostgreSQL | Database |
| Redis | Cache and token-related workflows |
| Docker | Containerized deployment |
| Render | Backend deployment configuration |
| Vite | Frontend build tool |

## 8.3 DEPLOYMENT PLAN

The backend can be deployed using Docker. The `render.yaml` file defines a Render web service with Dockerfile path, health check, port, environment, database URL, Redis URL, JWT secret, token expiry, and allowed origins.

Deployment requirements:

- PostgreSQL database URL.
- Redis URL.
- JWT secret.
- Allowed frontend origin.
- Production environment variable.
- Docker build support.

The frontend can be deployed using a static hosting provider such as Vercel, Netlify, or similar service. The frontend requires the API base URL through `VITE_API_URL`.

## 8.4 SECURITY CONSIDERATIONS

Security considerations include:

- Passwords are stored as hashes.
- JWT tokens protect private endpoints.
- Public profile should not expose email.
- Role and organization membership checks protect organization routes.
- SQL queries use parameterized statements.
- Rate limiting middleware is available.
- Sensitive configuration is stored in environment variables.
- GitHub push protection was encountered and resolved by removing a leaked token from local history.
- Future work should add stronger validation, audit logs, and automated security tests.

# 13. CONCLUSION AND FUTURE WORK

## 13.1 CONCLUSION

The Senior Design Project successfully designed and implemented a web-based platform for task sharing and workload optimization. The system addresses the practical problem of task delays caused by employee unavailability by introducing a structured internal marketplace where task owners can post tasks, employees can bid, and suitable bidders can be approved.

The project achieved the main academic and engineering objectives of requirement analysis, full-stack system design, database modeling, backend API development, frontend implementation, authentication, task workflow design, analytics, profile management, and documentation. The layered architecture makes the system maintainable and extendable. The use of Go, Gin, PostgreSQL, Redis, React, TypeScript, and Tailwind CSS demonstrates a modern technology stack suitable for scalable web applications.

The project was not a complete success in every possible area, and this is important to state realistically. Some features, such as the full customer review system, advanced manager queue, deadline reminder automation, Swagger documentation, and full automated tests, remain future work. However, the implemented system provides a strong foundation and demonstrates the feasibility of the proposed approach.

The main takeaway is that task delegation can be improved by combining bidding, skill visibility, approval workflow, analytics, and reputation data. This approach can reduce delays, improve transparency, and help organizations use employee skills more effectively.

## 13.2 FUTURE WORK

Table 13.1 Future enhancement roadmap

| Priority | Feature | Description |
| --- | --- | --- |
| 1 | Full Reviews System | Add customer/task-owner reviews and display them on public profiles |
| 2 | Task Lifecycle Timeline | Show chronological activity for every task |
| 3 | Manager Review Queue | Central page for pending approvals, completions, overdue tasks, and disputes |
| 4 | Completion Evidence | Require assignees to submit notes, PR links, demo links, or attachments |
| 5 | Dispute and Revision Flow | Add submitted, revision requested, disputed, and resolved states |
| 6 | Bid Ranking Score | Rank bids using skills, rating, ETA, workload, and success rate |
| 7 | Availability Calendar | Let users mark available, busy, on leave, or overloaded |
| 8 | Workload Dashboard | Show team capacity, active tasks, overdue work, and upcoming deadlines |
| 9 | Organization Invite Polish | Improve email invites, accept invite page, role assignment, and org switcher |
| 10 | Real-Time Notifications | Add live toasts, notification badge, reconnect handling, and preference support |
| 11 | Swagger Documentation | Generate browsable API documentation |
| 12 | Unit Tests | Add service-layer and repository-layer tests |
| 13 | Advanced Security | Add stronger validation, audit checks, and dependency monitoring |
| 14 | Export Reports | Export analytics and task reports as PDF/CSV |
| 15 | Mobile Application | Build companion mobile app for notifications and quick bidding |

Future work should focus first on completing the profile reviews feature, manager review queue, task timeline, and completion evidence. These features would make the platform more realistic and closer to production usage.

# 14. REFERENCES

Atlassian. (n.d.). Jira software documentation. Atlassian. https://support.atlassian.com/jira-software-cloud/

Axios. (n.d.). Axios documentation. https://axios-http.com/

Chart.js. (n.d.). Chart.js documentation. https://www.chartjs.org/docs/latest/

Docker. (n.d.). Docker documentation. https://docs.docker.com/

Gin Web Framework. (n.d.). Gin documentation. https://gin-gonic.com/docs/

GitHub. (n.d.). GitHub Docs: Secret scanning and push protection. https://docs.github.com/code-security/secret-scanning

Go Documentation. (n.d.). The Go programming language documentation. https://go.dev/doc/

Monday.com. (n.d.). Work management platform documentation. https://support.monday.com/

PostgreSQL Global Development Group. (n.d.). PostgreSQL documentation. https://www.postgresql.org/docs/

React. (n.d.). React documentation. https://react.dev/

Redis. (n.d.). Redis documentation. https://redis.io/docs/

Render. (n.d.). Render documentation. https://render.com/docs

TanStack. (n.d.). TanStack Query documentation. https://tanstack.com/query/latest

Tailwind Labs. (n.d.). Tailwind CSS documentation. https://tailwindcss.com/docs

Trello. (n.d.). Trello guide. Atlassian. https://trello.com/guide

TypeScript. (n.d.). TypeScript documentation. https://www.typescriptlang.org/docs/

Vite. (n.d.). Vite documentation. https://vitejs.dev/guide/

Wieruch, R. (2022). The road to React. Leanpub.

Fowler, M. (2002). Patterns of enterprise application architecture. Addison-Wesley.

Sommerville, I. (2016). Software engineering (10th ed.). Pearson.

Pressman, R. S., & Maxim, B. R. (2019). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill Education.

# 15. APPENDICES

## APPENDIX 1: SOFTWARE REQUIREMENTS SUMMARY

The project requirements are derived from the SRS for a web-based platform for task sharing and workload optimization. The main requirements are authentication, task posting, task viewing, bidding, bid management, assignment, progress tracking, completion review, notifications, admin control, and analytics dashboard.

## APPENDIX 2: DATABASE TABLE SUMMARY

Important tables:

- users
- tasks
- bids
- organizations
- memberships
- invitations
- subscriptions
- notifications
- activity_feed
- comments
- checklist_items
- audit_log
- user_reviews (planned)
- task_submissions (planned)
- user_availability (planned)

## APPENDIX 3: IMPORTANT API ROUTES

Authentication:

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`

Tasks:

- GET `/api/v1/tasks`
- POST `/api/v1/tasks`
- GET `/api/v1/tasks/:id`
- PUT `/api/v1/tasks/:id`
- DELETE `/api/v1/tasks/:id`
- PATCH `/api/v1/tasks/:id/status`

Bids:

- POST `/api/v1/tasks/:id/bids`
- GET `/api/v1/tasks/:id/bids`
- PATCH `/api/v1/bids/:id/approve`
- PATCH `/api/v1/bids/:id/reject`

Analytics:

- GET `/api/v1/analytics/dashboard`
- GET `/api/v1/analytics/me`

Profiles:

- GET `/api/v1/users/me/profile`
- GET `/api/v1/users/:id/profile`
- PUT `/api/v1/users/me`

Notifications:

- GET `/api/v1/notifications`
- GET `/api/v1/notifications/stream`
- PATCH `/api/v1/notifications/read-all`

## APPENDIX 4: SAMPLE USER PROFILE RESPONSE

```json
{
  "id": "user-id",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "employee",
  "avatar_url": "https://example.com/avatar.png",
  "bio": "Frontend developer with experience in React and TypeScript.",
  "skills": ["React", "TypeScript", "UI/UX"],
  "resume_url": "https://linkedin.com/in/alice",
  "created_at": "2026-04-01T10:00:00Z",
  "total_points": 4500,
  "avg_rating": 4.8,
  "rating_count": 12,
  "tasks_applied": 30,
  "tasks_accepted": 18,
  "total_tasks_posted": 6,
  "total_tasks_completed": 16,
  "total_bids_placed": 30,
  "total_bids_won": 18,
  "success_rate": 0.60,
  "task_history": [],
  "bid_history": [],
  "reviews": []
}
```

## APPENDIX 5: SAMPLE TASK CREATION REQUEST

```json
{
  "title": "Build real-time chat feature",
  "description": "Create a chat module with WebSocket support and message history.",
  "skills": ["React", "TypeScript", "WebSockets"],
  "questions": ["Have you built a chat system before?"],
  "deadline": "2026-05-15T10:00:00Z",
  "priority": "high"
}
```

## APPENDIX 6: SAMPLE BID REQUEST

```json
{
  "message": "I have experience building real-time chat applications using WebSockets.",
  "estimated_completion": "2026-05-10T10:00:00Z",
  "answers": {
    "Have you built a chat system before?": "Yes, I built one for a SaaS dashboard."
  }
}
```

## APPENDIX 7: EDGE CASE CHECKLIST

Authentication:

- Invalid login.
- Expired access token.
- Expired refresh token.
- Logout invalidates token.
- Password change rejects wrong current password.

Tasks:

- Empty title.
- Deadline in the past.
- Invalid priority.
- Invalid status transition.
- Non-owner update attempt.
- Delete non-existent task.

Bids:

- Bid on own task.
- Duplicate bid.
- Bid on closed task.
- Approve bid by non-owner.
- Approve already approved bid.
- Reject already rejected bid.

Profiles:

- Missing avatar.
- Empty skills.
- Invalid resume URL.
- Public profile hides email.
- User with no reviews.
- User with no accepted tasks.

Reviews:

- Review before completion.
- Duplicate review.
- Self-review.
- Review unassigned user.

Notifications:

- Redis unavailable.
- Duplicate event.
- User disabled notification type.
- SSE disconnected.

## APPENDIX 8: SAMPLE TEST COMMANDS

Backend:

```bash
cd backend
go test ./...
go vet ./...
go build ./cmd/api
```

Frontend:

```bash
cd frontend
npm install
npm run build
npm run lint
npm audit --omit=dev
```

## APPENDIX 9: PROJECT FILE STRUCTURE SUMMARY

Backend:

```text
backend/
  cmd/api/main.go
  internal/config/
  internal/database/
  internal/handlers/
  internal/middleware/
  internal/models/
  internal/repository/
  internal/services/
  internal/utils/
  migrations/
```

Frontend:

```text
frontend/
  src/components/
  src/pages/
  src/services/
  src/store/
  src/design-system/
  src/types/
```

Documentation:

```text
docs/
  ANALYTICS_FEATURE.md
  ANALYTICS_SETUP_GUIDE.md
  ANALYTICS_UI_PREVIEW.md
  EMAIL_OTP_IMPLEMENTATION_PLAN.md
  NEXT_PHASE_FEATURE_ROADMAP.md
  UI_UX_RESEARCH_DOCUMENT.md
  ZEROTH_REVIEW.md
```

## APPENDIX 10: FINAL REPORT FORMATTING NOTES

The final submitted document should follow:

- A4 page size.
- Left margin: 3.81 cm.
- Right margin: 2.54 cm.
- Top margin: 2.54 cm.
- Bottom margin: 2.54 cm.
- Times New Roman, 12 pt for body text.
- Chapter heading: 16 pt, bold.
- Section heading: 14 pt, uppercase.
- Subsection heading: 12 pt, uppercase.
- 1.5 line spacing for main text.
- Arabic page numbers at bottom center.
- Preliminary pages can use Roman numerals if required by the department.
- Captions may use 10 pt or above.
- Figures and tables should be numbered chapter-wise or sequentially.
- References should be in APA format.
- White flexible cover with black letters if total pages are between 60 and 100.


