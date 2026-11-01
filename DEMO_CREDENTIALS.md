# HOSPITRACK — DEMO CREDENTIALS

> [!WARNING]
> **DEVELOPMENT / PRESENTATION ONLY**
> These accounts and passwords are for local evaluation, presentation, and automated testing only.
> NEVER use these credentials in a public or production healthcare deployment.

---

## 🏥 Pre-Seeded Demonstration Accounts

| Role | Email Address | Password | Identity / Facility Scope | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `admin@hospitrack.com` | `Admin@Hospitrack2026!` (or `admin123`) | System Administrator | National Directory Oversight, Facility Onboarding, Audit Ledger |
| **HOSPITAL_ADMIN** | `admin@citygeneral.in` | `Hospital@123!` (or `hospital123`) | City General Hospital Admin (`CGH-01`) | Inpatient Admission, Bed Management, Dispatch Referrals/Transfers |
| **HOSPITAL_ADMIN** | `operations@apexcare.in` | `Hospital@123!` (or `hospital123`) | Apex Care Medical Center (`ACM-02`) | Inpatient Admission, Bed Management, Triage Inbound Requests |
| **DOCTOR** | `s.sharma@citygeneral.in` | `Doctor@123!` (or `doctor123`) | Dr. Sarah Sharma (Cardiology) | Clinical Consultations, Prescriptions (Duplicate Drug Check), Labns |
| **DOCTOR** | `dr.sarah@citygeneral.com` | `Doctor@123!` (or `doctor123`) | Dr. Sarah Sharma (Cardiology) | Clinical Consultations, Prescriptions (Duplicate Drug Check), Labs |
| **DOCTOR** | `dr.arjun@apexcare.com` | `Doctor@123!` (or `doctor123`) | Dr. Arjun Verma (General Medicine) | Clinical Consultations, Prescriptions, Specialist Referrals |
| **DOCTOR** | `r.verma@apexcare.in` | `Doctor@123!` (or `doctor123`) | Dr. Arjun Verma (General Medicine) | Clinical Consultations, Prescriptions, Specialist Referrals |
| **PATIENT** | `rahul.sharma@gmail.com` | `Patient@123!` (or `patient123`) | Rahul Sharma (`PAT-300`, B+) | Connected Care Journey, Multi-Hospital Records, Referrals |
| **PATIENT** | `john.doe@email.com` | `Patient@123!` (or `patient123`) | John Doe (`PAT-301`, O+) | Longitudinal Care Timeline, Medication Regimens, Print Summary |
| **PATIENT** | `rajesh.kumar@email.com` | `Patient@123!` (or `patient123`) | Rajesh Kumar (`PAT-302`, B+) | Emergency Inpatient Health Records & Care Timeline |

---

## 🔒 Security Notice

1. In Phase 1, public patient registration assigns `ACTIVE` status directly for immediate evaluation.
2. Hospital registration assigns `PENDING_APPROVAL` status and requires Super Admin review.
3. Super Admin credentials are automatically initialized upon startup if not present, and can be configured via environment variables `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`.

---

## 📝 Newly Registered Accounts

| Role | Name / Facility | Email Address | Password | Registered At | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PATIENT** | Vikramaditya Test | `newtest.patient1790150856826@example.com` | `NewPatient@2026!` | 2026-09-23 13:37:36 | `ACTIVE` |
| **PATIENT** | Aarav Sharma | `testpatient_1790150890407@example.com` | `PatientPass123!` | 2026-09-23 13:38:10 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Memorial Hospital | `testhosp_1790150890576@facility.com` | `HospitalAdminPass123!` | 2026-09-23 13:38:10 | `PENDING_APPROVAL` |
| **PATIENT** | Prashant Kumar | `parshantpremi693@gmail.com` | `Parsahnt789@` | 2026-09-24 10:57:08 | `ACTIVE` |
| **PATIENT** | Aarav Sharma | `testpatient_1790238070152@example.com` | `PatientPass123!` | 2026-09-24 13:51:10 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Memorial Hospital | `testhosp_1790238070349@facility.com` | `HospitalAdminPass123!` | 2026-09-24 13:51:10 | `PENDING_APPROVAL` |
| **PATIENT** | Password Tester | `pwtest_1790238080243@example.com` | `InitialPassword123!` | 2026-09-24 13:51:20 | `ACTIVE` |
| **PATIENT** | Aarav Sharma | `testpatient_1790238330278@example.com` | `PatientPass123!` | 2026-09-24 13:55:30 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Memorial Hospital | `testhosp_1790238330454@facility.com` | `HospitalAdminPass123!` | 2026-09-24 13:55:30 | `PENDING_APPROVAL` |
| **PATIENT** | Password Tester | `pwtest_1790238340270@example.com` | `InitialPassword123!` | 2026-09-24 13:55:40 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790238359142@email.com` | `SecurePass123!` | 2026-09-24 13:55:59 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790238359920@hospital.org` | `HospitalAdmin123!` | 2026-09-24 13:55:59 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790238360059@email.com` | `Password123!` | 2026-09-24 13:56:00 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790238396010@email.com` | `SecurePass123!` | 2026-09-24 13:56:36 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790238396800@hospital.org` | `HospitalAdmin123!` | 2026-09-24 13:56:36 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790238396946@email.com` | `Password123!` | 2026-09-24 13:56:37 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790238429690@email.com` | `SecurePass123!` | 2026-09-24 13:57:09 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790238430460@hospital.org` | `HospitalAdmin123!` | 2026-09-24 13:57:10 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790238430599@email.com` | `Password123!` | 2026-09-24 13:57:10 | `ACTIVE` |
| **PATIENT** | Aarav Sharma | `testpatient_1790243444022@example.com` | `PatientPass123!` | 2026-09-24 15:20:44 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Memorial Hospital | `testhosp_1790243444209@facility.com` | `HospitalAdminPass123!` | 2026-09-24 15:20:44 | `PENDING_APPROVAL` |
| **PATIENT** | New Patient User | `newpatient1790330920965@email.com` | `SecurePass123!` | 2026-09-25 15:38:41 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790330921848@hospital.org` | `HospitalAdmin123!` | 2026-09-25 15:38:41 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790330921994@email.com` | `Password123!` | 2026-09-25 15:38:42 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790331065215@email.com` | `SecurePass123!` | 2026-09-25 15:41:05 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790331066016@hospital.org` | `HospitalAdmin123!` | 2026-09-25 15:41:06 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790331066171@email.com` | `Password123!` | 2026-09-25 15:41:06 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790331823714@email.com` | `SecurePass123!` | 2026-09-25 15:53:43 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790331824562@hospital.org` | `HospitalAdmin123!` | 2026-09-25 15:53:44 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790331824714@email.com` | `Password123!` | 2026-09-25 15:53:44 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790332031007@email.com` | `SecurePass123!` | 2026-09-25 15:57:11 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790332031835@hospital.org` | `HospitalAdmin123!` | 2026-09-25 15:57:11 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790332031980@email.com` | `Password123!` | 2026-09-25 15:57:12 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790333539933@email.com` | `SecurePass123!` | 2026-09-25 16:22:20 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790333540704@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:22:20 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790333540843@email.com` | `Password123!` | 2026-09-25 16:22:20 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790333589607@email.com` | `SecurePass123!` | 2026-09-25 16:23:09 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790333590371@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:23:10 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790333590517@email.com` | `Password123!` | 2026-09-25 16:23:10 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790334065234@email.com` | `SecurePass123!` | 2026-09-25 16:31:05 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790334066026@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:31:06 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790334066172@email.com` | `Password123!` | 2026-09-25 16:31:06 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790334155216@email.com` | `SecurePass123!` | 2026-09-25 16:32:35 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790334156040@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:32:36 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790334156186@email.com` | `Password123!` | 2026-09-25 16:32:36 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790334661211@email.com` | `SecurePass123!` | 2026-09-25 16:41:01 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790334662010@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:41:02 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790334662148@email.com` | `Password123!` | 2026-09-25 16:41:02 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790335014310@email.com` | `SecurePass123!` | 2026-09-25 16:46:54 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790335015074@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:46:55 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790335015219@email.com` | `Password123!` | 2026-09-25 16:46:55 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790335164229@email.com` | `SecurePass123!` | 2026-09-25 16:49:24 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790335165164@hospital.org` | `HospitalAdmin123!` | 2026-09-25 16:49:25 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790335165323@email.com` | `Password123!` | 2026-09-25 16:49:25 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790335840370@email.com` | `SecurePass123!` | 2026-09-25 17:00:40 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790335841132@hospital.org` | `HospitalAdmin123!` | 2026-09-25 17:00:41 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790335841278@email.com` | `Password123!` | 2026-09-25 17:00:41 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790336248120@email.com` | `SecurePass123!` | 2026-09-25 17:07:28 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790336248870@hospital.org` | `HospitalAdmin123!` | 2026-09-25 17:07:28 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790336249009@email.com` | `Password123!` | 2026-09-25 17:07:29 | `ACTIVE` |
| **PATIENT** | New Patient User | `newpatient1790346569954@email.com` | `SecurePass123!` | 2026-09-25 19:59:30 | `ACTIVE` |
| **HOSPITAL_ADMIN** | St. Jude Care Center | `facility1790346570763@hospital.org` | `HospitalAdmin123!` | 2026-09-25 19:59:30 | `PENDING_APPROVAL` |
| **PATIENT** | Original User | `duplicate1790346570917@email.com` | `Password123!` | 2026-09-25 19:59:30 | `ACTIVE` |
| **PATIENT** | Priya Sharma | `priya.1790411102745@example.com` | `Priya@Secure123!` | 2026-09-26 13:55:02 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790589585145@citygeneral.in` | `DoctorSecret@123` | 2026-09-28 15:29:45 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1790589585738@citygeneral.in` | `DocPassword@123` | 2026-09-28 15:29:45 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790589660231@citygeneral.in` | `Rahul@Secret2026!` | 2026-09-28 15:31:00 | `ACTIVE` |
| **DOCTOR** | Dr. Ananya Roy | `ananya.roy.test@citygeneral.in` | `DoctorPass@2026!` | 2026-09-28 15:44:45 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790592701963@citygeneral.in` | `DoctorSecret@123` | 2026-09-28 16:21:42 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1790592702563@citygeneral.in` | `DocPassword@123` | 2026-09-28 16:21:42 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790593169391@citygeneral.in` | `DoctorSecret@123` | 2026-09-28 16:29:29 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1790593169984@citygeneral.in` | `DocPassword@123` | 2026-09-28 16:29:30 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.536@citygeneral.in` | `Doctor@123!` | 2026-09-28 16:29:30 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790593239650@citygeneral.in` | `DoctorSecret@123` | 2026-09-28 16:30:39 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1790593240214@citygeneral.in` | `DocPassword@123` | 2026-09-28 16:30:40 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.755@citygeneral.in` | `Doctor@123!` | 2026-09-28 16:30:40 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790593275356@citygeneral.in` | `DoctorSecret@123` | 2026-09-28 16:31:15 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1790593275932@citygeneral.in` | `DocPassword@123` | 2026-09-28 16:31:15 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.6460@citygeneral.in` | `Doctor@123!` | 2026-09-28 16:31:16 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1790593759160@citygeneral.in` | `DoctorSecret@123` | 2026-09-28 16:39:19 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1790593759785@citygeneral.in` | `DocPassword@123` | 2026-09-28 16:39:19 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793253063288@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 11:21:03 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793253063857@citygeneral.in` | `DocPassword@123` | 2026-10-29 11:21:03 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.4392@citygeneral.in` | `Doctor@123!` | 2026-10-29 11:21:04 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793254954972@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 11:52:35 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793254955608@citygeneral.in` | `DocPassword@123` | 2026-10-29 11:52:35 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.6199@citygeneral.in` | `Doctor@123!` | 2026-10-29 11:52:36 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793260762730@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 13:29:22 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793260763076@citygeneral.in` | `DocPassword@123` | 2026-10-29 13:29:23 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.3649@citygeneral.in` | `Doctor@123!` | 2026-10-29 13:29:23 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793260958429@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 13:32:38 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793260959264@citygeneral.in` | `DocPassword@123` | 2026-10-29 13:32:39 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793260983598@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 13:33:03 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793260984125@citygeneral.in` | `DocPassword@123` | 2026-10-29 13:33:04 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.4656@citygeneral.in` | `Doctor@123!` | 2026-10-29 13:33:04 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793263908514@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 14:21:48 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793263909048@citygeneral.in` | `DocPassword@123` | 2026-10-29 14:21:49 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.9596@citygeneral.in` | `Doctor@123!` | 2026-10-29 14:21:49 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793265642601@citygeneral.in` | `DoctorSecret@123` | 2026-10-29 14:50:42 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793265643157@citygeneral.in` | `DocPassword@123` | 2026-10-29 14:50:43 | `ACTIVE` |
| **DOCTOR** | Dr. Vivek Nambiar | `dr.test.3702@citygeneral.in` | `Doctor@123!` | 2026-10-29 14:50:43 | `ACTIVE` |
| **DOCTOR** | DEEEPAK PANDEY | `deepak@apexcare.in` | `Deepak123@!` | 2026-10-30 13:40:21 | `ACTIVE` |
| **DOCTOR** | Dr. Rahul Verma | `dr.rahul.1793352349791@citygeneral.in` | `DoctorSecret@123` | 2026-10-30 14:55:50 | `ACTIVE` |
| **DOCTOR** | Dr. Login Test | `dr.login.1793352350642@citygeneral.in` | `DocPassword@123` | 2026-10-30 14:55:50 | `ACTIVE` |
| **PATIENT** | Kavita Rao | `kavita.1793382964214@gmail.com` | `KavitaPass@2026` | 2026-10-30 23:26:04 | `ACTIVE` |
| **DOCTOR** | Dr. Rohit Sen | `dr.rohit.1793382964779@citygeneral.in` | `RohitSecure@2026` | 2026-10-30 23:26:04 | `ACTIVE` |
| **DOCTOR** | Dr. Workstation Test | `dr.work.1793382965018@citygeneral.in` | `DoctorWork@123!` | 2026-10-30 23:26:05 | `ACTIVE` |
| **DOCTOR** | Dr. Anand Kulkarni | `dr.anand.1793382965353@citygeneral.in` | `DoctorPass@123!` | 2026-10-30 23:26:05 | `ACTIVE` |
| **PATIENT** | Aarav Singhania | `patient.1793382965481@gmail.com` | `PatientSecret@123` | 2026-10-30 23:26:05 | `ACTIVE` |
| **PATIENT** | Meera Nambiar | `meera.1793382966226@gmail.com` | `Meera@Password99` | 2026-10-30 23:26:06 | `ACTIVE` |
| **PATIENT** | Onboarded Patient | `onboarded6235@test.org` | `PatientInit123!` | 2026-10-30 23:27:46 | `ACTIVE` |
| **PATIENT** | NIKHIL SHARMA | `nikhilsharma@gmail.com` | `Nikhil@123!` | 2026-11-01 14:45:00 | `ACTIVE` |
| **PATIENT** | Aarav Patel | `aarav.patel.1793528321808@example.com` | `Patient@123!` | 2026-11-01 15:48:42 | `ACTIVE` |
| **PATIENT** | Neha Gupta | `neha.gupta.1793528322280@example.com` | `Patient@123!` | 2026-11-01 15:48:42 | `ACTIVE` |
