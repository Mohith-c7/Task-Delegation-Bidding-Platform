# Task-Delegation-Bidding-Platform
 Task-sharing marketplace within an organization

#SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
Project Title: Task Delegation and Bidding Platform for Software Teams
#1. Introduction
1.1 Purpose
The purpose of this system is to provide an internal platform for software organizations where
employees can temporarily delegate their assigned tasks when they are unavailable due to illness,
emergencies, or workload. Other team members can view posted tasks, bid to take them up, and
upon managerial approval, complete the tasks on behalf of the original owner. This ensures
uninterrupted workflow and improved team productivity.
1.2 Scope
The system acts as a task-sharing marketplace within an organization. It allows task posting by
unavailable employees, bidding by interested employees, approval by managers, progress tracking,
and task completion review. The platform is intended for internal enterprise use and can be scaled
for multi-team environments in future versions.
1.3 Definitions
Task Owner: Employee who originally owns the task.
Bidder: Employee interested in completing the posted task.
Manager: Person responsible for approving task delegation.
Admin: System administrator.
Bid: A request by a bidder to take over a task.
#2. Overall Description
2.1 Product Perspective
The system is a web-based application integrated into an organization’s workflow. It complements
existing task management tools by adding a delegation and bidding layer.
2.2 User Classes
Task Owner: Posts tasks when unavailable.
Bidder: Views tasks and places bids.
Manager: Approves or rejects bids.
Admin: Manages users and system settings.
2.3 Operating Environment
Web Application accessible through modern browsers and hosted on cloud or internal servers.
2.4 Design Constraints
Role-based access control, secure authentication, and data privacy within organization.
2.5 Assumptions
Users belong to the same organization, tasks are software-related, and managers have authority to
approve delegations.
#3. Functional Requirements
FR1: User Authentication – Users must log in using organization credentials.
FR2: Task Posting – Task Owner can post a new task with title, description, skills, deadline, and
priority.
FR3: Task Viewing – Bidders can view open tasks and filter them.
FR4: Bidding – Bidders can place bids with ETA and approach message.
FR5: Bid Management – Manager selects and approves bidder.
FR6: Task Assignment – Approved bidder becomes temporary task handler.
FR7: Progress Tracking – Bidder updates progress; Manager monitors status.
FR8: Task Completion – Bidder marks completion; Manager reviews closure.
FR9: Notifications – Users receive updates on task and bid activities.
FR10: Admin Control – Admin manages users and roles.
#4. Non-Functional Requirements
Performance: Supports 500 concurrent users with response time under 3 seconds.
Security: Secure login and role-based authorization.
Reliability: 99% uptime.
Usability: Simple and intuitive UI.
Scalability: Supports multiple teams.
Maintainability: Modular and easy to update.
#5. System Architecture
Client Layer: Web Browser UI.
Application Layer: Backend Server handling logic.
Database Layer: Stores Users, Tasks, Bids, and Logs.
#6. Database Requirements
Users Table: User_ID, Name, Email, Role.
Tasks Table: Task_ID, Title, Description, Owner_ID, Deadline, Status.
Bids Table: Bid_ID, Task_ID, Bidder_ID, Message, ETA, Status.
#7. External Interface Requirements
User Interface: Dashboards, Task Listings, Bid Forms, Approval Panels.
Communication Interface: Email or in-app notifications.
#8. Future Enhancements
Integration with Jira/GitHub, Mobile Application, Analytics Dashboard.
#9. Conclusion
This system provides an efficient solution for handling employee unavailability in software teams by
introducing a transparent and structured task delegation process. It ensures workflow continuity,
better workload distribution, and improved project reliability.
