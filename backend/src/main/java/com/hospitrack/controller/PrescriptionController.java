package com.hospitrack.controller;

import com.hospitrack.dto.ApiResponse;
import com.hospitrack.dto.PrescriptionRequest;
import com.hospitrack.entity.Prescription;
import com.hospitrack.entity.PrescriptionItem;
import com.hospitrack.security.UserPrincipal;
import com.hospitrack.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Prescription>>> getPrescriptions(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String doctorId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (patientId != null && !patientId.isBlank()) {
            List<Prescription> list = prescriptionService.getPrescriptionsByPatient(patientId);
            return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved.", list));
        }
        String docId = (doctorId != null && !doctorId.isBlank()) ? doctorId : (principal != null ? principal.getDoctorId() : null);
        if (docId != null) {
            List<Prescription> list = prescriptionService.getPrescriptionsByDoctor(docId);
            return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved.", list));
        }
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved.", java.util.Collections.emptyList()));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@dataGuard.canAccessPatient(#patientId)")
    public ResponseEntity<ApiResponse<List<Prescription>>> getPrescriptionsByPatient(@PathVariable String patientId) {
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved.", prescriptions));
    }

    @GetMapping("/patient/{patientId}/reconciliation")
    @PreAuthorize("@dataGuard.canAccessPatient(#patientId)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReconciliation(@PathVariable String patientId) {
        Map<String, Object> recon = prescriptionService.getReconciliationByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Medication reconciliation dossier retrieved.", recon));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@dataGuard.canAccessPrescription(#id)")
    public ResponseEntity<ApiResponse<Prescription>> getPrescriptionById(@PathVariable String id) {
        Prescription prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Prescription retrieved.", prescription));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (request.getDoctorId() == null && principal.getDoctorId() != null) {
            request.setDoctorId(principal.getDoctorId());
        }
        if (request.getHospitalId() == null && principal.getHospitalId() != null) {
            request.setHospitalId(principal.getHospitalId());
        }

        Prescription created = prescriptionService.createPrescription(request, principal.getId(), principal.getRole().name(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Prescription order signed successfully.", created));
    }

    @PatchMapping("/items/{itemId}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PrescriptionItem>> updateItemStatus(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String status = body != null ? body.get("status") : "ACTIVE";
        String reason = body != null ? body.get("reason") : null;
        PrescriptionItem updated = prescriptionService.updateItemStatus(itemId, status, reason, principal.getId(), principal.getRole().name(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Medication order status updated successfully.", updated));
    }

    @PostMapping("/safety-check")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('DOCTOR') or hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<com.hospitrack.dto.ClinicalSafetyReportDto>> evaluateSafety(
            @Valid @RequestBody PrescriptionRequest request
    ) {
        com.hospitrack.dto.ClinicalSafetyReportDto report = prescriptionService.evaluateSafety(request);
        return ResponseEntity.ok(ApiResponse.success("Clinical safety evaluation completed.", report));
    }
}
