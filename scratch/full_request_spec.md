<USER_REQUEST>
# HOSPITRACK — REAL-WORLD SPECIALIST REFERRAL WORKFLOW REDESIGN AND FUNCTIONAL REPAIR

Act as a senior healthcare workflow architect, hospital operations specialist, full-stack developer, and premium SaaS UI/UX designer.

Inspect the existing Hospitrack application and repair the Specialist Referral Pipeline shown in the attached screenshot. The current page displays unformatted statistics and a basic lifecycle list. It does not communicate a real clinical referral workflow clearly.

Your objective is to transform this into a professional, realistic, fully functional hospital-to-hospital referral management interface while preserving the existing application, database, API contracts, authorization, and working features.

Do not create a static mockup. Implement the actual workflow using the existing backend and data model. First inspect the current referral entities, statuses, endpoints, permissions, and UI components.

## 1. Build a realistic referral operations dashboard

Create a clean, modern interface with a white/off-white background, dark readable text, restrained teal accents, consistent spacing, subtle borders, polished cards, and professional typography.

### Page header
- Title: Specialist Referrals
- Description: Coordinate specialist referrals, track receiving-facility decisions, and manage continuity of patient care.
- Primary action: Create Referral
- Secondary actions: Refresh and Export, only if supported.
- Show the selected hospital/facility context where appropriate.

### Summary cards
Use actual backend data to show:
- All Referrals
- Awaiting Review
- Accepted
- Transfer Required or Transfer Pending
- In Treatment
- Completed

Each card should have a clear count, concise description, and meaningful status color. Clicking a card should filter the referral list to that status.

Use real counts. Do not invent referrals, statuses, or statistics.

## 2. Create a practical referral work queue

Replace the current plain lifecycle list with a real referral table or responsive record list.

Each referral should display, where supported by actual data:

- Referral ID.
- Patient name and patient identifier.
- Referring hospital or department.
- Receiving hospital or specialist.
- Referral reason or specialty.
- Clinical priority.
- Date and time created.
- Current status.
- Assigned or reviewing clinician.
- Last updated time.
- Next required action.

Make the next action immediately understandable. For example:
- Awaiting receiving facility review.
- Additional clinical information required.
- Accepted — transfer coordination required.
- Transfer in progress.
- Patient received — specialist consultation pending.
- Treatment in progress.
- Completed — outcome documentation pending.

These labels must reflect the actual stored status and available workflow data. Do not infer that a patient has been transferred or received without confirmation.

Provide:
- Search by patient, referral ID, or hospital.
- Filters for status, priority, specialty, facility, and date where supported.
- Sorting by newest, oldest, priority, and last updated where appropriate.
- Pagination if required.
- Useful empty, loading, and error states.
- A clear-filter action.

Filters and search must work with actual data.

## 3. Implement the real referral lifecycle

Inspect the current backend before deciding which states already exist. Map existing statuses into a clear lifecycle without breaking stored records or API compatibility.

A typical workflow is:

1. Referral Created
2. Clinical Review
3. Sent to Receiving Facility
4. Accepted, Declined, or More Information Required
5. Transfer Coordination, if required
6. Patient Arrival and Receipt Confirmation
7. Specialist Consultation or Treatment
8. Outcome Documentation
9. Referral Completed

Cancellation or closure should be a separate authorized path with a recorded reason.

Do not assume that every referral requires physical transfer. Remote consultation, specialist advice, and facility transfer may be different workflows if supported by the project.

For every transition:
- Check the current status.
- Verify that the acting user has permission.
- Validate required information.
- Enforce valid state transitions on the backend.
- Record who performed the action and when.
- Save the change transactionally.
- Return a meaningful error for invalid transitions.
- Refresh the UI after successful updates.

Do not allow arbitrary status changes through a dropdown that bypasses workflow rules.

## 4. Create a complete referral detail view

Clicking a referral should open a dedicated detail page or well-designed drawer.

Organize it into clear sections:

### Referral overview
- Referral ID and current status.
- Patient identity using the minimum information needed.
- Referring facility and receiving facility.
- Requested specialty and clinical reason.
- Priority and creation time.
- Assigned clinicians, where available.

### Clinical information
Display only fields already supported by the system, such as:
- Referral reason.
- Symptoms and relevant clinical notes.
- Relevant diagnoses.
- Requested specialist service.
- Current treatment and medication summary, where authorized.
- Attachments or reports, if supported.

Apply strict role-based access to sensitive patient information.

### Timeline and audit history
Show a chronological activity timeline with:
- Referral creation.
- Submission.
- Review.
- Acceptance or decline.
- Requests for additional information.
- Transfer coordination.
- Confirmed patient receipt.
- Specialist care and outcome.
- Completion or cancellation.

Each event should show the actual actor, timestamp, and recorded action. Do not fabricate historical events.

### Action panel
Display only the actions the current user is authorized to perform and that are valid for the current state.

## 5. Implement role-specific referral actions

### Referring Hospital Admin or authorized clinician
Where permitted:
- Create a referral.
- Select an eligible patient.
- Select a receiving facility or specialist.
- Provide referral reason, specialty, priority, and necessary clinical information.
- Attach supported documents.
- Submit the referral.
- View progress.
- Respond to information requests.
- Cancel a referral when allowed, with a reason.

Validate patient and facility selections against real backend records.

### Receiving Hospital Admin or authorized clinician
Where permitted:
- View incoming referrals for their facility.
- Review submitted clinical information.
- Accept a referral.
- Decline a referral with a mandatory reason.
- Request additional information.
- Assign a reviewing clinician or specialist.
- Record availability or scheduling details if supported.
- Confirm patient arrival only when actually received.

Enforce hospital-level data isolation. A hospital must not see or modify referrals belonging to unrelated facilities unless an explicitly authorized role permits it.

### Doctor
Where permitted:
- Review assigned referrals.
- View authorized clinical details.
- Add specialist notes.
- Record consultation or treatment progress.
- Request additional information.
- Record an outcome or recommend follow-up.
- Complete the clinical portion of a referral when allowed.

A doctor must not be able to perform unauthorized hospital administration or transfer actions.

### Super Admin
Provide appropriate oversight and referral monitoring only where authorized by the existing permission model. Do not expose unrestricted patient data or allow the Super Admin interface to bypass audit controls.

## 6. Make transfer coordination explicit

When the referral requires physical transfer, show a distinct transfer workflow linked to the referral.

Track supported information such as:
- Transfer requirement.
- Coordination status.
- Origin and destination.
- Responsible coordinator.
- Planned transfer time, if recorded.
- Actual departure, if confirmed.
- Receiving-facility arrival confirmation.
- Transfer notes and relevant events.

Do not mark a transfer complete simply because a referral is accepted.

Do not claim an ambulance has been dispatched, a patient has departed, or a facility has received the patient unless the relevant action or integration confirms it.

If the application has no real ambulance or emergency dispatch integration, clearly label the feature as coordination rather than dispatch.

## 7. Notifications and communication

Use the existing notification system where available.

Generate appropriate in-app notifications for events such as:
- New incoming referral.
- Referral accepted or declined.
- Additional information requested.
- Transfer coordination required.
- Patient arrival recorded.
- Outcome documented.
- Referral completed.

Avoid duplicate notifications and make delivery status truthful. Do not claim email, SMS, or external delivery unless the relevant provider confirms it.

If comments or secure communication are supported, link them to the referral and enforce permissions. Do not expose sensitive clinical information in public notifications.

## 8. Make the lifecycle visual and understandable

Replace the plain numbered lifecycle with a polished workflow visualization.

Show:
- Completed stages.
- Current stage.
- Pending stages.
- Blocked or declined states.
- Cancellation or closure where applicable.

Include stage labels and timestamps when available. A user should understand the referral's current position and next required action at a glance.

Do not show a stage as complete merely because it appears later in the lifecycle.

The referral detail timeline must be based on real persisted events. If the backend does not store a history, implement a compatible audit/event approach only after inspecting the existing architecture and migration strategy.

## 9. Data integrity, security, and clinical safety

- Preserve existing patient and hospital relationships.
- Use backend authorization for every sensitive operation.
- Validate all inputs server-side.
- Prevent unauthorized access through direct API calls.
- Preserve hospital data isolation.
- Avoid logging passwords, tokens, or unnecessary clinical information.
- Use transactions for related status and assignment updates.
- Prevent duplicate submissions and conflicting assignments.
- Handle concurrent updates safely where practical.
- Record consequential changes in the audit trail.
- Do not silently discard existing referral records.
- Do not fabricate clinical notes, timestamps, outcomes, or patient events.
- Use the application's existing authentication and permission model.

If a workflow step is not supported by the current schema or integrations, identify the gap and implement it only with a safe, backward-compatible design.

## 10. Visual design requirements

The page must look like a real hospital operations platform, not a text report.

Use:
- A clear title and action area.
- Compact, aligned summary cards.
- A clean search and filter toolbar.
- Readable status badges.
- Properly aligned table columns.
- Clear patient and facility information hierarchy.
- Consistent action buttons.
- Well-designed detail drawers and confirmation dialogs.
- Meaningful icons with accessible labels.
- Subtle transitions and hover states.
- Responsive desktop, tablet, and mobile layouts.
- Accessible contrast and keyboard navigation.

Avoid:
- Unstyled default buttons.
- Statistics scattered down the page.
- Oversized empty sections.
- Overcrowded navigation.
- Excessive bright colors.
- Fake charts and decorative controls.
- Actions that are visible but do nothing.

Use the existing shared design system and repair its root CSS/component issues instead of introducing another conflicting styling layer.

## 11. Test the complete end-to-end workflow

Test with designated test accounts and test data:

1. An authorized clinician creates a referral.
2. The referral appears in the correct outgoing queue.
3. The receiving facility sees it in its incoming queue.
4. An authorized reviewer opens the referral.
5. The reviewer accepts, declines with a reason, or requests more information.
6. The referring facility sees the updated status.
7. Additional information can be submitted if requested.
8. Transfer coordination occurs only when required.
9. Patient receipt is recorded only after confirmation.
10. The specialist records consultation or treatment progress.
11. The outcome is documented.
12. The referral is completed through a valid transition.
13. The timeline and audit history reflect actual actions.
14. Notifications appear according to the real notification implementation.
15. Unauthorized users are blocked from restricted actions and data.

Also test invalid transitions, missing required fields, duplicate submissions, API failures, and two users attempting conflicting updates.

Run the existing automated tests, build, and lint checks. Inspect browser console errors and network requests.

## 12. Execution rules

Work in the existing repository and complete the feature in one coordinated implementation task.

First audit the current referral model, API, and status definitions. Reuse existing functionality where possible. Make controlled changes and add database migrations only when necessary.

Do not replace working referral functionality with mock data. Do not claim tests passed without executing them. Do not claim visual verification without inspecting the actual rendered page.

At completion, report:
- Root causes of the current UI defects.
- Referral states and transitions implemented.
- Frontend and backend files changed.
- Database migrations, if any.
- Role-based actions implemented.
- End-to-end tests actually executed.
- Build and lint results.
- Remaining limitations or integrations that are not connected.

Start by inspecting the existing referral implementation, then implement and verify the complete real-world workflow.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-29T09:41:15+05:30.

The user's current state is as follows:
Active Document: s:\hospitrack-project\backend\src\main\java\com\hospitrack\controller\AdminController.java (LANGUAGE_UNSPECIFIED)
Cursor is on line: 36
Other open documents:
- s:\hospitrack-project\js\store.js (LANGUAGE_UNSPECIFIED)
- s:\hospitrack-project\backend\Dockerfile (LANGUAGE_UNSPECIFIED)
- s:\hospitrack-project\.gitignore (LANGUAGE_UNSPECIFIED)
- s:\hospitrack-project\render.yaml (LANGUAGE_UNSPECIFIED)
- s:\hospitrack-project\js\authService.js (LANGUAGE_UNSPECIFIED)

The user has uploaded 1 image(s):
- C:/Users/sande/.gemini/antigravity/brain/73cfaf60-6f37-4fc0-8356-6c857fa2bbe8/.user_uploaded/media_1793246970664_fe579591.jpg
You can embed this image in an artifact if you need the USER to review it.
</ADDITIONAL_METADATA>