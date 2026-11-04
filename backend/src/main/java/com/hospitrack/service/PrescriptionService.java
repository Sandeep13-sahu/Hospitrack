package com.hospitrack.service;

import com.hospitrack.dto.PrescriptionRequest;
import com.hospitrack.entity.Prescription;
import com.hospitrack.entity.PrescriptionItem;
import com.hospitrack.exception.BadRequestException;
import com.hospitrack.exception.PrescriptionSafetyViolationException;
import com.hospitrack.exception.ResourceNotFoundException;
import com.hospitrack.repository.PrescriptionItemRepository;
import com.hospitrack.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final AuditService auditService;
    private final PatientEventStreamService eventStreamService;
    private final ClinicalSafetyEngine clinicalSafetyEngine;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            AuditService auditService,
            PatientEventStreamService eventStreamService,
            ClinicalSafetyEngine clinicalSafetyEngine
    ) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.auditService = auditService;
        this.eventStreamService = eventStreamService;
        this.clinicalSafetyEngine = clinicalSafetyEngine;
    }

    @Transactional(readOnly = true)
    public com.hospitrack.dto.ClinicalSafetyReportDto evaluateSafety(PrescriptionRequest request) {
        return clinicalSafetyEngine.evaluatePrescriptionSafety(request);
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPrescriptionsByPatient(String patientId) {
        return prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPrescriptionsByDoctor(String doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    @Transactional(readOnly = true)
    public Prescription getPrescriptionById(String id) {
        return prescriptionRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));
    }

    @Transactional
    public Prescription createPrescription(PrescriptionRequest request, String actorId, String actorRole, String actorName) {
        if (request.getMedicines() == null || request.getMedicines().isEmpty()) {
            throw new BadRequestException("Prescription must contain at least one medicine.");
        }

        // Duplicate medicine safety enforcement rule (preserves exact backward compatibility)
        Set<String> seenNames = new HashSet<>();
        for (PrescriptionRequest.MedicineItemDto item : request.getMedicines()) {
            String normalizedName = item.getName() != null ? item.getName().trim().toLowerCase() : "";
            if (seenNames.contains(normalizedName)) {
                throw new PrescriptionSafetyViolationException(
                        "CRITICAL PRESCRIPTION SAFETY RULE VIOLATION: Duplicate medicine '" + item.getName() + "' detected within this prescription. Each medication item in a single prescription order must be unique."
                );
            }
            seenNames.add(normalizedName);
        }

        // Comprehensive Clinical Decision Support Safety Analysis
        com.hospitrack.dto.ClinicalSafetyReportDto safetyReport = clinicalSafetyEngine.evaluatePrescriptionSafety(request);
        if (safetyReport.isHasContraindication()) {
            com.hospitrack.dto.ClinicalSafetyAlertDto contra = safetyReport.getAlerts().stream()
                    .filter(a -> "CONTRAINDICATED".equalsIgnoreCase(a.getSeverity()))
                    .findFirst().orElse(null);
            String detail = contra != null ? contra.getTitle() + ": " + contra.getDescription() : "Contraindicated drug therapy.";
            throw new PrescriptionSafetyViolationException("CRITICAL SAFETY BLOCK: " + detail);
        }

        if (safetyReport.isHasAllergyAlert() && !Boolean.TRUE.equals(request.getOverrideConfirmed())) {
            com.hospitrack.dto.ClinicalSafetyAlertDto allergyAlert = safetyReport.getAlerts().stream()
                    .filter(a -> "ALLERGY_CONTRAINDICATION".equalsIgnoreCase(a.getSeverity()))
                    .findFirst().orElse(null);
            String detail = allergyAlert != null ? allergyAlert.getTitle() : "Documented patient drug allergy match.";
            throw new PrescriptionSafetyViolationException("CRITICAL DRUG-ALLERGY ALERT: " + detail + " Documented patient allergy detected. Clinical override rationale is required to proceed.");
        }

        if (safetyReport.isHasMajorAlert() && !Boolean.TRUE.equals(request.getOverrideConfirmed())) {
            com.hospitrack.dto.ClinicalSafetyAlertDto majorAlert = safetyReport.getAlerts().stream()
                    .filter(a -> "MAJOR".equalsIgnoreCase(a.getSeverity()))
                    .findFirst().orElse(null);
            String detail = majorAlert != null ? majorAlert.getTitle() : "Severe Drug-Drug Interaction detected.";
            throw new PrescriptionSafetyViolationException("HIGH-RISK DRUG INTERACTION: " + detail + " Clinical override rationale required before signing pharmacotherapy order.");
        }

        long count = prescriptionRepository.count();
        String id = "RX-" + (800 + count + 1);
        int seq = 0;
        while (prescriptionRepository.existsById(id)) {
            seq++;
            id = "RX-" + (800 + count + 1 + seq);
        }
        Prescription prescription = new Prescription(
                id,
                request.getVisitId(),
                request.getPatientId(),
                request.getDoctorId(),
                request.getHospitalId(),
                LocalDateTime.now()
        );
        prescription.setOrderType(request.getOrderType() != null ? request.getOrderType() : "INPATIENT");
        prescription.setInstructions(request.getInstructions());
        prescription.setClinicalOverrideReason(request.getClinicalOverrideReason());

        for (PrescriptionRequest.MedicineItemDto itemDto : request.getMedicines()) {
            PrescriptionItem item = new PrescriptionItem(
                    itemDto.getName(),
                    itemDto.getDosage(),
                    itemDto.getFrequency(),
                    itemDto.getDuration(),
                    itemDto.getInstructions()
            );
            item.setBrandName(itemDto.getBrandName());
            item.setDrugCategory(itemDto.getDrugCategory());
            item.setDosageForm(itemDto.getDosageForm() != null ? itemDto.getDosageForm() : "Tablet");
            item.setRoute(itemDto.getRoute() != null ? itemDto.getRoute() : "Oral");
            item.setMealTiming(itemDto.getMealTiming());
            item.setPatientInstructions(itemDto.getPatientInstructions());
            item.setIsStat(Boolean.TRUE.equals(itemDto.getIsStat()));
            item.setIsPrn(Boolean.TRUE.equals(itemDto.getIsPrn()));
            item.setPrnIndication(itemDto.getPrnIndication());
            item.setPrnMinIntervalHours(itemDto.getPrnMinIntervalHours());
            item.setPrnMaxDailyDoses(itemDto.getPrnMaxDailyDoses());
            item.setAdministrationTimes(itemDto.getAdministrationTimes());
            item.setTakeHomeQuantity(itemDto.getTakeHomeQuantity());
            item.setRefillCount(itemDto.getRefillCount() != null ? itemDto.getRefillCount() : 0);
            item.setOrderType(itemDto.getOrderType() != null ? itemDto.getOrderType() : prescription.getOrderType());
            item.setStatus(itemDto.getStatus() != null ? itemDto.getStatus() : "ACTIVE");
            item.setIvInfusionRate(itemDto.getIvInfusionRate());
            item.setIvDiluent(itemDto.getIvDiluent());
            item.setReconciliationStatus(itemDto.getReconciliationStatus());

            prescription.addItem(item);
        }

        Prescription saved = prescriptionRepository.save(prescription);

        StringBuilder medSummary = new StringBuilder();
        for (int i = 0; i < request.getMedicines().size(); i++) {
            if (i > 0) medSummary.append(", ");
            PrescriptionRequest.MedicineItemDto m = request.getMedicines().get(i);
            medSummary.append(m.getName()).append(" (").append(m.getDosage()).append(" - ").append(m.getFrequency()).append(")");
        }

        auditService.logEvent(actorId, actorRole, actorName, "PRESCRIPTION_CREATED", "PRESCRIPTION", saved.getId(),
                "Issued " + saved.getOrderType() + " prescription " + saved.getId() + " for " + saved.getPatientId() + ": " + medSummary);

        if (Boolean.TRUE.equals(request.getOverrideConfirmed()) && request.getClinicalOverrideReason() != null && !request.getClinicalOverrideReason().isBlank()) {
            auditService.logEvent(actorId, actorRole, actorName, "PRESCRIPTION_CLINICAL_OVERRIDE", "PRESCRIPTION", saved.getId(),
                    "Physician override confirmed for " + saved.getId() + ": " + request.getClinicalOverrideReason().trim());
        }

        if (saved.getPatientId() != null) {
            eventStreamService.emitPatientEvent(saved.getPatientId(), "PRESCRIPTION_CREATED", saved);
        }

        return saved;
    }

    @Transactional
    public PrescriptionItem updateItemStatus(Long itemId, String newStatus, String reason, String actorId, String actorRole, String actorName) {
        PrescriptionItem item = prescriptionItemRepository.findById(Objects.requireNonNull(itemId))
                .orElseThrow(() -> new ResourceNotFoundException("Prescription item not found: " + itemId));

        String normalizedStatus = newStatus != null ? newStatus.trim().toUpperCase() : "ACTIVE";
        item.setStatus(normalizedStatus);

        if ("DISCONTINUED".equalsIgnoreCase(normalizedStatus)) {
            if (reason == null || reason.trim().isBlank()) {
                throw new BadRequestException("Mandatory clinical reason is required to discontinue medication order.");
            }
            item.setDiscontinueReason(reason.trim());
            item.setDiscontinuedAt(LocalDateTime.now());
            item.setDiscontinuedBy(actorName != null ? actorName : actorId);
        } else if ("HELD".equalsIgnoreCase(normalizedStatus)) {
            item.setHoldReason(reason != null ? reason.trim() : "Clinical hold order placed.");
        } else if ("ACTIVE".equalsIgnoreCase(normalizedStatus)) {
            item.setHoldReason(null);
        }

        PrescriptionItem updated = prescriptionItemRepository.save(item);

        auditService.logEvent(actorId, actorRole, actorName, "MEDICATION_STATUS_CHANGED", "PRESCRIPTION_ITEM", String.valueOf(itemId),
                "Updated medication '" + item.getName() + "' status to " + normalizedStatus + (reason != null ? " (Reason: " + reason.trim() + ")" : ""));

        if (item.getPrescription() != null && item.getPrescription().getPatientId() != null) {
            eventStreamService.emitPatientEvent(item.getPrescription().getPatientId(), "MEDICATION_STATUS_CHANGED", updated);
        }

        return updated;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReconciliationByPatient(String patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId);
        List<PrescriptionItem> inpatientActive = new ArrayList<>();
        List<PrescriptionItem> inpatientDiscontinued = new ArrayList<>();
        List<PrescriptionItem> dischargeMeds = new ArrayList<>();

        for (Prescription rx : prescriptions) {
            for (PrescriptionItem item : rx.getItems()) {
                if ("DISCHARGE".equalsIgnoreCase(item.getOrderType()) || "DISCHARGE".equalsIgnoreCase(rx.getOrderType())) {
                    dischargeMeds.add(item);
                } else {
                    if ("DISCONTINUED".equalsIgnoreCase(item.getStatus())) {
                        inpatientDiscontinued.add(item);
                    } else {
                        inpatientActive.add(item);
                    }
                }
            }
        }

        Map<String, Object> recon = new HashMap<>();
        recon.put("patientId", patientId);
        recon.put("activeInpatientMedications", inpatientActive);
        recon.put("discontinuedInpatientMedications", inpatientDiscontinued);
        recon.put("dischargeMedications", dischargeMeds);
        return recon;
    }
}
