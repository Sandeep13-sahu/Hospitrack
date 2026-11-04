package com.hospitrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospitrack.dto.PrescriptionRequest;
import com.hospitrack.dto.TransferRequest;
import com.hospitrack.entity.Patient;
import com.hospitrack.entity.Role;
import com.hospitrack.entity.User;
import com.hospitrack.repository.PatientRepository;
import com.hospitrack.repository.UserRepository;
import com.hospitrack.security.JwtTokenProvider;
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

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SuppressWarnings("null")
public class ClinicalWorkflowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User doctorUser;
    private User hospitalAdminUser;
    private User hosp103User;

    @BeforeEach
    void setUp() {
        if (!userRepository.existsByEmailIgnoreCase("doc.workflow@citygeneral.in")) {
            doctorUser = new User("USER-DOC-WF", "Dr. Sarah Sharma", "doc.workflow@citygeneral.in", passwordEncoder.encode("Pass123!"), Role.DOCTOR);
            doctorUser.setDoctorId("DOC-201");
            doctorUser.setHospitalId("HOSP-101");
            doctorUser = userRepository.save(doctorUser);
        } else {
            doctorUser = userRepository.findByEmailIgnoreCase("doc.workflow@citygeneral.in").orElseThrow();
        }

        if (!userRepository.existsByEmailIgnoreCase("hosp.admin@citygeneral.in")) {
            hospitalAdminUser = new User("USER-HOSP-WF", "City General Admin", "hosp.admin@citygeneral.in", passwordEncoder.encode("Pass123!"), Role.HOSPITAL_ADMIN);
            hospitalAdminUser.setHospitalId("HOSP-101");
            hospitalAdminUser = userRepository.save(hospitalAdminUser);
        } else {
            hospitalAdminUser = userRepository.findByEmailIgnoreCase("hosp.admin@citygeneral.in").orElseThrow();
        }

        if (!userRepository.existsByEmailIgnoreCase("admin@medilife.in")) {
            hosp103User = new User("USER-HOSP-103", "MediLife Admin", "admin@medilife.in", passwordEncoder.encode("Pass123!"), Role.HOSPITAL_ADMIN);
            hosp103User.setHospitalId("HOSP-103");
            hosp103User = userRepository.save(hosp103User);
        } else {
            hosp103User = userRepository.findByEmailIgnoreCase("admin@medilife.in").orElseThrow();
        }
    }

    @Test
    @DisplayName("[1] Prescription Safety: Duplicate drug in single prescription order is REJECTED (422 Unprocessable Entity)")
    void testDuplicateDrugRejected() throws Exception {
        String tokenDoctor = jwtTokenProvider.generateTokenFromUser(doctorUser);

        PrescriptionRequest req = new PrescriptionRequest();
        req.setPatientId("PAT-301");
        req.setDoctorId("DOC-201");
        req.setHospitalId("HOSP-101");

        List<PrescriptionRequest.MedicineItemDto> items = new ArrayList<>();
        PrescriptionRequest.MedicineItemDto med1 = new PrescriptionRequest.MedicineItemDto();
        med1.setName("Pantoprazole");
        med1.setDosage("40mg");
        med1.setFrequency("Once daily");
        items.add(med1);

        PrescriptionRequest.MedicineItemDto med2 = new PrescriptionRequest.MedicineItemDto();
        med2.setName("Aspirin");
        med2.setDosage("75mg");
        med2.setFrequency("Once daily");
        items.add(med2);

        PrescriptionRequest.MedicineItemDto med3Duplicate = new PrescriptionRequest.MedicineItemDto();
        med3Duplicate.setName("Pantoprazole"); // Duplicate!
        med3Duplicate.setDosage("20mg");
        med3Duplicate.setFrequency("Twice daily");
        items.add(med3Duplicate);

        req.setMedicines(items);

        mockMvc.perform(post("/api/prescriptions")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("CRITICAL PRESCRIPTION SAFETY RULE VIOLATION: Duplicate medicine 'Pantoprazole' detected")));
    }

    @Test
    @DisplayName("[2] Prescription Signing: Valid prescription with unique medicines SUCCEEDS")
    void testValidPrescriptionSigned() throws Exception {
        String tokenDoctor = jwtTokenProvider.generateTokenFromUser(doctorUser);

        PrescriptionRequest req = new PrescriptionRequest();
        req.setPatientId("PAT-301");
        req.setDoctorId("DOC-201");
        req.setHospitalId("HOSP-101");

        List<PrescriptionRequest.MedicineItemDto> items = new ArrayList<>();
        PrescriptionRequest.MedicineItemDto med1 = new PrescriptionRequest.MedicineItemDto();
        med1.setName("Metoprolol");
        med1.setDosage("25mg");
        med1.setFrequency("Twice daily");
        items.add(med1);

        PrescriptionRequest.MedicineItemDto med2 = new PrescriptionRequest.MedicineItemDto();
        med2.setName("Atorvastatin");
        med2.setDosage("20mg");
        med2.setFrequency("Once at night");
        items.add(med2);

        req.setMedicines(items);

        mockMvc.perform(post("/api/prescriptions")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(org.hamcrest.Matchers.startsWith("RX-")));
    }

    @Test
    @DisplayName("[3] Emergency Transfer Workflow: Initiated transfer accepts and reassigns facility & bed accounting")
    void testEmergencyTransferFlow() throws Exception {
        String tokenHosp = jwtTokenProvider.generateTokenFromUser(hospitalAdminUser);

        TransferRequest req = new TransferRequest();
        req.setPatientId("PAT-301");
        req.setFromHospitalId("HOSP-101");
        req.setToHospitalId("HOSP-103");
        req.setPriority("EMERGENCY");
        req.setReason("Tertiary Cardiac Cath Lab Transfer");

        String resStr = mockMvc.perform(post("/api/transfers")
                        .header("Authorization", "Bearer " + tokenHosp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        String transferId = objectMapper.readTree(resStr).path("data").path("id").asText();

        // Hospital 103 accepts transfer
        String tokenHosp103 = jwtTokenProvider.generateTokenFromUser(hosp103User);

        mockMvc.perform(post("/api/transfers/" + transferId + "/accept")
                        .header("Authorization", "Bearer " + tokenHosp103))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        Patient transferredPatient = patientRepository.findById("PAT-301").orElseThrow();
        assertEquals("HOSP-103", transferredPatient.getCurrentHospitalId(), "Patient facility must update to destination hospital HOSP-103");
    }

    @Test
    @DisplayName("[4] Hospital Controlled Patient Onboarding & Doctor Assignment")
    void testPatientOnboardingAndDoctorAssignment() throws Exception {
        String tokenHosp = jwtTokenProvider.generateTokenFromUser(hospitalAdminUser);

        String uniqueEmail = "onboarded" + (System.currentTimeMillis() % 10000) + "@test.org";

        com.hospitrack.dto.PatientRequest pReq = new com.hospitrack.dto.PatientRequest();
        pReq.setName("Onboarded Patient");
        pReq.setEmail(uniqueEmail);
        pReq.setGender("Male");
        pReq.setAge(48);
        pReq.setBloodGroup("AB+");
        pReq.setContact("+91 91234 56789");
        pReq.setAddress("77 Green Avenue");
        pReq.setEmergencyContact("+91 91234 98765");
        pReq.setPassword("PatientInit123!");
        pReq.setPrimaryDoctorId("DOC-201");

        // 1. Hospital Admin onboards patient
        String resStr = mockMvc.perform(post("/api/patients")
                        .header("Authorization", "Bearer " + tokenHosp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentHospitalId").value("HOSP-101"))
                .andReturn().getResponse().getContentAsString();

        String createdPatientId = objectMapper.readTree(resStr).path("data").path("id").asText();

        // 2. Hospital Admin assigns Doctor
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/patients/" + createdPatientId + "/assign-doctor")
                        .header("Authorization", "Bearer " + tokenHosp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"doctorId\":\"DOC-201\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.primaryDoctorId").value("DOC-201"));

        // 3. Newly provisioned patient can log in
        com.hospitrack.dto.LoginRequest loginReq = new com.hospitrack.dto.LoginRequest();
        loginReq.setIdentifier(uniqueEmail);
        loginReq.setPassword("PatientInit123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.user.role").value("PATIENT"));
    }

    @Test
    @DisplayName("[5] Discharge State Machine: Doctor Approval -> Hospital Clearance Approval -> DISCHARGED")
    void testDischargeStateMachine() throws Exception {
        String tokenDoctor = jwtTokenProvider.generateTokenFromUser(doctorUser);
        String tokenHosp = jwtTokenProvider.generateTokenFromUser(hospitalAdminUser);

        // Doctor requests discharge
        mockMvc.perform(post("/api/patients/PAT-301/discharge-request")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clinicalSummary\":\"Patient stable, vitals normalized, recovery complete.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DOCTOR_APPROVED"));

        // Hospital Admin reviews clearance and gives final approval
        mockMvc.perform(post("/api/patients/PAT-301/discharge-clearance")
                        .header("Authorization", "Bearer " + tokenHosp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearanceNotes\":\"Billing settled, pharmacy medication reconciled, administrative clearance granted.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DISCHARGED"));

        Patient discharged = patientRepository.findById("PAT-301").orElseThrow();
        assertEquals("DISCHARGED", discharged.getStatus());
    }

    @Test
    @DisplayName("[6] Cross-Hospital Discharge Isolation: Admin from HOSP-103 attempting to discharge patient from HOSP-102 is DENIED (403 Forbidden)")
    void testCrossHospitalDischargeDenied() throws Exception {
        String tokenHosp103 = jwtTokenProvider.generateTokenFromUser(hosp103User);

        // HOSP-103 Admin attempts to discharge PAT-303 (which belongs to HOSP-102)
        mockMvc.perform(post("/api/patients/PAT-303/discharge-clearance")
                        .header("Authorization", "Bearer " + tokenHosp103)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearanceNotes\":\"Unauthorized cross-facility clearance attempt\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[7] Role Enforcement: Doctor attempting hospital administrative final discharge is DENIED (403 Forbidden)")
    void testDoctorCannotPerformHospitalDischargeClearance() throws Exception {
        String tokenDoctor = jwtTokenProvider.generateTokenFromUser(doctorUser);

        mockMvc.perform(post("/api/patients/PAT-301/discharge-clearance")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearanceNotes\":\"Doctor administrative bypass attempt\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[8] Double Discharge Protection: Attempting to discharge an already discharged patient returns 400 Bad Request")
    void testAlreadyDischargedPatientRejected() throws Exception {
        String tokenHosp = jwtTokenProvider.generateTokenFromUser(hospitalAdminUser);

        // First ensure PAT-305 is in DISCHARGED status
        Patient p5 = patientRepository.findById("PAT-305").orElseThrow();
        p5.setStatus("DISCHARGED");
        patientRepository.save(p5);

        // Attempt second discharge
        mockMvc.perform(post("/api/patients/PAT-305/discharge-clearance")
                        .header("Authorization", "Bearer " + tokenHosp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearanceNotes\":\"Duplicate discharge attempt\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Patient is already marked as discharged."));
    }

    @Test
    @DisplayName("[9] Inpatient Medication Prescribing: Supports STAT, SOS/PRN, and Interval frequencies with full clinical metadata")
    void testInpatientPrescriptionWithAdvancedFrequencies() throws Exception {
        String tokenDoctor = jwtTokenProvider.generateTokenFromUser(doctorUser);

        PrescriptionRequest req = new PrescriptionRequest();
        req.setPatientId("PAT-301");
        req.setDoctorId("DOC-201");
        req.setHospitalId("HOSP-101");
        req.setOrderType("INPATIENT");

        List<PrescriptionRequest.MedicineItemDto> items = new ArrayList<>();

        // 1. STAT order
        PrescriptionRequest.MedicineItemDto statMed = new PrescriptionRequest.MedicineItemDto();
        statMed.setName("Furosemide (Lasix)");
        statMed.setDosage("40mg");
        statMed.setDosageForm("Injection");
        statMed.setFrequency("STAT");
        statMed.setRoute("Intravenous (IV)");
        statMed.setIsStat(true);
        statMed.setDuration("Single Dose");
        statMed.setInstructions("Acute pulmonary congestion; administer IV push stat over 2 minutes");
        items.add(statMed);

        // 2. SOS / PRN order
        PrescriptionRequest.MedicineItemDto prnMed = new PrescriptionRequest.MedicineItemDto();
        prnMed.setName("Paracetamol");
        prnMed.setDosage("650mg");
        prnMed.setDosageForm("Tablet");
        prnMed.setFrequency("SOS / PRN");
        prnMed.setRoute("Oral");
        prnMed.setIsPrn(true);
        prnMed.setPrnIndication("For fever > 101°F or severe body ache");
        prnMed.setPrnMinIntervalHours(4);
        prnMed.setPrnMaxDailyDoses(4);
        prnMed.setDuration("5 days");
        prnMed.setInstructions("Do not exceed 4 tablets in 24 hours");
        items.add(prnMed);

        // 3. Interval-based q8h order
        PrescriptionRequest.MedicineItemDto intervalMed = new PrescriptionRequest.MedicineItemDto();
        intervalMed.setName("Ceftriaxone");
        intervalMed.setDosage("1g");
        intervalMed.setDosageForm("IV Infusion");
        intervalMed.setFrequency("Every 8 Hours (q8h)");
        intervalMed.setRoute("Intravenous (IV)");
        intervalMed.setAdministrationTimes("08:00, 16:00, 00:00");
        intervalMed.setIvInfusionRate("100 mL/hr");
        intervalMed.setIvDiluent("Normal Saline 100mL");
        intervalMed.setDuration("7 days");
        items.add(intervalMed);

        req.setMedicines(items);

        String responseBody = mockMvc.perform(post("/api/prescriptions")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderType").value("INPATIENT"))
                .andExpect(jsonPath("$.data.items", org.hamcrest.Matchers.hasSize(3)))
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(responseBody);
        long prnItemId = root.path("data").path("items").get(1).path("id").asLong();

        // [10] Test Medication Status transitions: HOLD and DISCONTINUE
        mockMvc.perform(patch("/api/prescriptions/items/" + prnItemId + "/status")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"HELD\",\"reason\":\"Pending liver function test review\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("HELD"))
                .andExpect(jsonPath("$.data.holdReason").value("Pending liver function test review"));

        // Test Discontinue with missing reason (should fail with 400 Bad Request)
        mockMvc.perform(patch("/api/prescriptions/items/" + prnItemId + "/status")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DISCONTINUED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Mandatory clinical reason is required to discontinue medication order."));

        // Discontinue with valid reason
        mockMvc.perform(patch("/api/prescriptions/items/" + prnItemId + "/status")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DISCONTINUED\",\"reason\":\"Fever resolved; therapy target achieved\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DISCONTINUED"))
                .andExpect(jsonPath("$.data.discontinueReason").value("Fever resolved; therapy target achieved"));

        // [11] Test Medication Reconciliation dossier retrieval
        mockMvc.perform(get("/api/prescriptions/patient/PAT-301/reconciliation")
                        .header("Authorization", "Bearer " + tokenDoctor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.activeInpatientMedications").isArray())
                .andExpect(jsonPath("$.data.discontinuedInpatientMedications").isArray());
    }

    @Test
    @DisplayName("[12] Discharge Medication Workflow: Discharge prescription with take-home quantity and patient instructions")
    void testDischargePrescriptionWorkflow() throws Exception {
        String tokenDoctor = jwtTokenProvider.generateTokenFromUser(doctorUser);

        PrescriptionRequest req = new PrescriptionRequest();
        req.setPatientId("PAT-301");
        req.setDoctorId("DOC-201");
        req.setHospitalId("HOSP-101");
        req.setOrderType("DISCHARGE");
        req.setInstructions("Post-discharge outpatient pharmacotherapy regimen. Review in 14 days.");

        List<PrescriptionRequest.MedicineItemDto> items = new ArrayList<>();

        PrescriptionRequest.MedicineItemDto homeMed1 = new PrescriptionRequest.MedicineItemDto();
        homeMed1.setName("Atorvastatin");
        homeMed1.setDosage("20mg");
        homeMed1.setDosageForm("Tablet");
        homeMed1.setFrequency("Once Daily (OD)");
        homeMed1.setRoute("Oral");
        homeMed1.setMealTiming("Bedtime (HS)");
        homeMed1.setDuration("30 days");
        homeMed1.setTakeHomeQuantity("30 Tablets");
        homeMed1.setRefillCount(1);
        homeMed1.setPatientInstructions("Take 1 tablet every night at bedtime with a glass of water for lipid control.");
        homeMed1.setOrderType("DISCHARGE");
        items.add(homeMed1);

        PrescriptionRequest.MedicineItemDto homeMed2 = new PrescriptionRequest.MedicineItemDto();
        homeMed2.setName("Aspirin (Ecosprin)");
        homeMed2.setDosage("75mg");
        homeMed2.setDosageForm("Tablet");
        homeMed2.setFrequency("Once Daily (OD)");
        homeMed2.setRoute("Oral");
        homeMed2.setMealTiming("After Meals");
        homeMed2.setDuration("30 days");
        homeMed2.setTakeHomeQuantity("30 Tablets");
        homeMed2.setRefillCount(2);
        homeMed2.setPatientInstructions("Take 1 tablet daily after breakfast. Do not take on an empty stomach.");
        homeMed2.setOrderType("DISCHARGE");
        items.add(homeMed2);

        req.setMedicines(items);

        mockMvc.perform(post("/api/prescriptions")
                        .header("Authorization", "Bearer " + tokenDoctor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderType").value("DISCHARGE"))
                .andExpect(jsonPath("$.data.items[0].takeHomeQuantity").value("30 Tablets"))
                .andExpect(jsonPath("$.data.items[0].patientInstructions").value(org.hamcrest.Matchers.containsString("Take 1 tablet every night")));
    }
}
