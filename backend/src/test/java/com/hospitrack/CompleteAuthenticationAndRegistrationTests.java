package com.hospitrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospitrack.dto.*;
import com.hospitrack.entity.*;
import com.hospitrack.repository.*;
import com.hospitrack.service.DatabaseSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CompleteAuthenticationAndRegistrationTests {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CompleteAuthenticationAndRegistrationTests.class);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DatabaseSeeder databaseSeeder;

    @BeforeEach
    void setUp() {
        log.info(">>> ENTERING setUp()");
    }

    // -------------------------------------------------------------------------
    // TEST 1: ACTIVE Patient + ACTIVE hospital = successful login
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[1] ACTIVE Patient + ACTIVE hospital = successful login")
    void testActivePatientActiveHospitalLoginSuccess() throws Exception {
        log.info(">>> ENTERING testActivePatientActiveHospitalLoginSuccess");
        LoginRequest req = new LoginRequest();
        req.setIdentifier("john.doe@email.com");
        req.setPassword("Patient@123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.user.role").value("PATIENT"))
                .andExpect(jsonPath("$.data.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.redirectUrl").value("/patient"));
    }

    // -------------------------------------------------------------------------
    // TEST 2: ACTIVE Patient + PENDING_APPROVAL hospital = successful login
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[2] ACTIVE Patient + PENDING_APPROVAL hospital = successful login")
    void testActivePatientPendingApprovalHospitalLoginSuccess() throws Exception {
        long ts = System.currentTimeMillis();
        String hospId = "HOSP-PENDING-" + ts;
        Hospital pendingHosp = new Hospital(hospId, "Pending Community Clinic", "PCC-" + ts, "Delhi", "+91 99000 11111", "pending." + ts + "@clinic.in", 50, 50);
        pendingHosp.setStatus("PENDING_APPROVAL");
        hospitalRepository.save(pendingHosp);

        String patEmail = "patient.pendinghosp." + ts + "@gmail.com";
        String patPass = "PatientPass123!";
        User patientUser = new User("USER-PAT-PEND-" + ts, "Admitted Patient", patEmail, passwordEncoder.encode(patPass), Role.PATIENT);
        patientUser.setStatus(AccountStatus.ACTIVE);
        patientUser.setHospitalId(hospId);
        patientUser.setPatientId("PAT-PEND-" + ts);
        userRepository.save(patientUser);

        Patient patient = new Patient("PAT-PEND-" + ts, "Admitted Patient", "Female", 29, "O+", "+91 99000 22222", patEmail, "Address", "Emergency", hospId, null);
        patientRepository.save(patient);

        // Login as Patient linked to pending hospital -> MUST SUCCEED (Patient is NOT blocked by facility status)
        LoginRequest req = new LoginRequest();
        req.setIdentifier(patEmail);
        req.setPassword(patPass);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("PATIENT"))
                .andExpect(jsonPath("$.data.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.redirectUrl").value("/patient"));
    }

    // -------------------------------------------------------------------------
    // TEST 3: ACTIVE Patient + SUSPENDED hospital = successful login
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[3] ACTIVE Patient + SUSPENDED hospital = successful login")
    void testActivePatientSuspendedHospitalLoginSuccess() throws Exception {
        long ts = System.currentTimeMillis();
        String hospId = "HOSP-SUSP-" + ts;
        Hospital suspHosp = new Hospital(hospId, "Suspended Facility", "SF-" + ts, "Mumbai", "+91 99000 33333", "susp." + ts + "@hospital.org", 80, 80);
        suspHosp.setStatus("SUSPENDED");
        hospitalRepository.save(suspHosp);

        String patEmail = "patient.susphosp." + ts + "@gmail.com";
        String patPass = "PatientPass123!";
        User patientUser = new User("USER-PAT-SUSP-" + ts, "Patient in Suspended Facility", patEmail, passwordEncoder.encode(patPass), Role.PATIENT);
        patientUser.setStatus(AccountStatus.ACTIVE);
        patientUser.setHospitalId(hospId);
        patientUser.setPatientId("PAT-SUSP-" + ts);
        userRepository.save(patientUser);

        Patient patient = new Patient("PAT-SUSP-" + ts, "Patient in Suspended Facility", "Male", 45, "B+", "+91 99000 44444", patEmail, "Address", "Emergency", hospId, null);
        patientRepository.save(patient);

        // Login as Patient linked to suspended hospital -> MUST SUCCEED (Patient data access is preserved)
        LoginRequest req = new LoginRequest();
        req.setIdentifier(patEmail);
        req.setPassword(patPass);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("PATIENT"));
    }

    // -------------------------------------------------------------------------
    // TEST 4: ACTIVE Doctor + ACTIVE hospital = successful login
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[4] ACTIVE Doctor + ACTIVE hospital = successful login")
    void testActiveDoctorActiveHospitalLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("s.sharma@citygeneral.in");
        req.setPassword("Doctor@123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("DOCTOR"))
                .andExpect(jsonPath("$.data.redirectUrl").value("/doctor"));
    }

    // -------------------------------------------------------------------------
    // TEST 5: Doctor + PENDING_APPROVAL hospital = blocked
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[5] Doctor + PENDING_APPROVAL hospital = blocked with approval message")
    void testDoctorPendingApprovalHospitalBlocked() throws Exception {
        long ts = System.currentTimeMillis();
        String hospId = "HOSP-DOCPEND-" + ts;
        Hospital pendingHosp = new Hospital(hospId, "Pending Facility", "PF-" + ts, "Chennai", "+91 99111 22222", "pendingdoc." + ts + "@hospital.org", 60, 60);
        pendingHosp.setStatus("PENDING_APPROVAL");
        hospitalRepository.save(pendingHosp);

        String docEmail = "dr.pending." + ts + "@pendingfac.in";
        String docPass = "DoctorPass123!";
        User docUser = new User("USER-DOCPEND-" + ts, "Dr. Pending Facility", docEmail, passwordEncoder.encode(docPass), Role.DOCTOR);
        docUser.setStatus(AccountStatus.ACTIVE);
        docUser.setHospitalId(hospId);
        docUser.setDoctorId("DOC-PEND-" + ts);
        userRepository.save(docUser);

        Doctor doc = new Doctor("DOC-PEND-" + ts, hospId, "Dr. Pending Facility", "Pediatrics", "MCI-PEND-" + ts, docEmail, "+91 99111 33333", 5);
        doctorRepository.save(doc);

        LoginRequest req = new LoginRequest();
        req.setIdentifier(docEmail);
        req.setPassword(docPass);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("pending administrator approval")));
    }

    // -------------------------------------------------------------------------
    // TEST 6: Doctor + SUSPENDED hospital = blocked
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[6] Doctor + SUSPENDED hospital = blocked with suspension message")
    void testDoctorSuspendedHospitalBlocked() throws Exception {
        long ts = System.currentTimeMillis();
        String hospId = "HOSP-DOCSUSP-" + ts;
        Hospital suspHosp = new Hospital(hospId, "Suspended Facility", "SF2-" + ts, "Kolkata", "+91 99222 33333", "suspdoc." + ts + "@hospital.org", 70, 70);
        suspHosp.setStatus("SUSPENDED");
        hospitalRepository.save(suspHosp);

        String docEmail = "dr.susp." + ts + "@suspfac.in";
        String docPass = "DoctorPass123!";
        User docUser = new User("USER-DOCSUSP-" + ts, "Dr. Suspended Facility", docEmail, passwordEncoder.encode(docPass), Role.DOCTOR);
        docUser.setStatus(AccountStatus.ACTIVE);
        docUser.setHospitalId(hospId);
        docUser.setDoctorId("DOC-SUSP-" + ts);
        userRepository.save(docUser);

        Doctor doc = new Doctor("DOC-SUSP-" + ts, hospId, "Dr. Suspended Facility", "Neurology", "MCI-SUSP-" + ts, docEmail, "+91 99222 44444", 8);
        doctorRepository.save(doc);

        LoginRequest req = new LoginRequest();
        req.setIdentifier(docEmail);
        req.setPassword(docPass);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("suspended")));
    }

    // -------------------------------------------------------------------------
    // TEST 7: Hospital Admin + PENDING_APPROVAL hospital = blocked
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[7] Hospital Admin + PENDING_APPROVAL hospital = blocked with approval message")
    void testHospitalAdminPendingApprovalHospitalBlocked() throws Exception {
        long ts = System.currentTimeMillis();
        String hospId = "HOSP-ADMINPEND-" + ts;
        Hospital pendingHosp = new Hospital(hospId, "Pending Hospital Admin Facility", "PHAF-" + ts, "Pune", "+91 99333 44444", "adminpend." + ts + "@facility.in", 100, 100);
        pendingHosp.setStatus("PENDING_APPROVAL");
        hospitalRepository.save(pendingHosp);

        String adminEmail = "admin.pend." + ts + "@facility.in";
        String adminPass = "HospitalPass123!";
        User adminUser = new User("USER-ADMINPEND-" + ts, "Pending Facility Administrator", adminEmail, passwordEncoder.encode(adminPass), Role.HOSPITAL_ADMIN);
        adminUser.setStatus(AccountStatus.PENDING_APPROVAL);
        adminUser.setHospitalId(hospId);
        userRepository.save(adminUser);

        LoginRequest req = new LoginRequest();
        req.setIdentifier(adminEmail);
        req.setPassword(adminPass);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("pending administrator approval")));
    }

    // -------------------------------------------------------------------------
    // TEST 8: Hospital Admin + APPROVED hospital = successful login
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[8] Hospital Admin + APPROVED hospital = successful login")
    void testHospitalAdminApprovedHospitalSuccess() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("admin@citygeneral.in");
        req.setPassword("Hospital@123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("HOSPITAL_ADMIN"))
                .andExpect(jsonPath("$.data.redirectUrl").value("/hospital"));
    }

    // -------------------------------------------------------------------------
    // TEST 9: Patient account PENDING_APPROVAL = role-appropriate message
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[9] Patient account PENDING_APPROVAL = role-appropriate message")
    void testPatientAccountPendingApprovalRoleAppropriateMessage() throws Exception {
        long ts = System.currentTimeMillis();
        String patEmail = "patient.pendingstatus." + ts + "@gmail.com";
        String patPass = "PatientPass123!";

        User patientUser = new User("USER-PAT-STAT-" + ts, "Verification Pending Patient", patEmail, passwordEncoder.encode(patPass), Role.PATIENT);
        patientUser.setStatus(AccountStatus.PENDING_APPROVAL);
        patientUser.setHospitalId("HOSP-101");
        userRepository.save(patientUser);

        LoginRequest req = new LoginRequest();
        req.setIdentifier(patEmail);
        req.setPassword(patPass);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Your account is pending verification. Please contact support."));
    }

    // -------------------------------------------------------------------------
    // TEST 10: Invalid password = rejected
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[10] Invalid password = rejected with 401 Unauthorized")
    void testInvalidPasswordRejected() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("john.doe@email.com");
        req.setPassword("TotallyWrongPass123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    // -------------------------------------------------------------------------
    // TEST 11: Ambiguous identifier = safely rejected
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[11] Ambiguous identifier (multiple phone matches) = safely rejected")
    void testAmbiguousIdentifierSafelyRejected() throws Exception {
        long ts = System.currentTimeMillis();
        String sharedPhone = "+91 99888 77777";

        User u1 = new User("USER-AMBIG-1-" + ts, "User One", "user1." + ts + "@test.org", passwordEncoder.encode("Pass123!"), Role.PATIENT);
        u1.setPhone(sharedPhone);
        userRepository.save(u1);

        User u2 = new User("USER-AMBIG-2-" + ts, "User Two", "user2." + ts + "@test.org", passwordEncoder.encode("Pass123!"), Role.HOSPITAL_ADMIN);
        u2.setPhone(sharedPhone);
        userRepository.save(u2);

        // Attempt login using ambiguous shared phone number
        LoginRequest req = new LoginRequest();
        req.setIdentifier(sharedPhone);
        req.setPassword("Pass123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    // -------------------------------------------------------------------------
    // TEST 12: Super Admin login = unaffected
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("[12] Super Admin login = unaffected")
    void testSuperAdminLoginUnaffected() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("admin@hospitrack.com");
        req.setPassword("Admin@Hospitrack2026!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.data.redirectUrl").value("/admin"));
    }
}
