package com.hospitrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_items", indexes = {
    @Index(name = "idx_rx_items_rx_id", columnList = "prescription_id"),
    @Index(name = "idx_rx_items_status", columnList = "status"),
    @Index(name = "idx_rx_items_order_type", columnList = "order_type")
})
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "brand_name", length = 128)
    private String brandName;

    @Column(name = "drug_category", length = 128)
    private String drugCategory;

    @Column(name = "dosage", nullable = false, length = 64)
    private String dosage;

    @Column(name = "dosage_form", length = 64)
    private String dosageForm = "Tablet";

    @Column(name = "frequency", nullable = false, length = 64)
    private String frequency;

    @Column(name = "route", length = 64)
    private String route = "Oral";

    @Column(name = "meal_timing", length = 64)
    private String mealTiming;

    @Column(name = "duration", length = 64)
    private String duration;

    @Column(name = "instructions", length = 500)
    private String instructions;

    @Column(name = "patient_instructions", length = 500)
    private String patientInstructions;

    @Column(name = "is_stat")
    private Boolean isStat = false;

    @Column(name = "is_prn")
    private Boolean isPrn = false;

    @Column(name = "prn_indication", length = 255)
    private String prnIndication;

    @Column(name = "prn_min_interval_hours")
    private Integer prnMinIntervalHours;

    @Column(name = "prn_max_daily_doses")
    private Integer prnMaxDailyDoses;

    @Column(name = "administration_times", length = 255)
    private String administrationTimes;

    @Column(name = "take_home_quantity", length = 64)
    private String takeHomeQuantity;

    @Column(name = "refill_count")
    private Integer refillCount = 0;

    @Column(name = "order_type", length = 32)
    private String orderType = "INPATIENT"; // INPATIENT, DISCHARGE

    @Column(name = "status", length = 32)
    private String status = "ACTIVE"; // ACTIVE, HELD, DISCONTINUED, COMPLETED

    @Column(name = "discontinue_reason", length = 255)
    private String discontinueReason;

    @Column(name = "discontinued_at")
    private LocalDateTime discontinuedAt;

    @Column(name = "discontinued_by", length = 128)
    private String discontinuedBy;

    @Column(name = "hold_reason", length = 255)
    private String holdReason;

    @Column(name = "iv_infusion_rate", length = 64)
    private String ivInfusionRate;

    @Column(name = "iv_diluent", length = 128)
    private String ivDiluent;

    @Column(name = "reconciliation_status", length = 32)
    private String reconciliationStatus;

    public PrescriptionItem() {}

    public PrescriptionItem(String name, String dosage, String frequency, String duration, String instructions) {
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.instructions = instructions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMedicineName() { return name; }
    public void setMedicineName(String medicineName) {
        if (medicineName != null && !medicineName.isBlank()) {
            this.name = medicineName.trim();
        }
    }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }

    public String getDrugCategory() { return drugCategory; }
    public void setDrugCategory(String drugCategory) { this.drugCategory = drugCategory; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getDosageForm() { return dosageForm; }
    public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public String getMealTiming() { return mealTiming; }
    public void setMealTiming(String mealTiming) { this.mealTiming = mealTiming; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getPatientInstructions() { return patientInstructions; }
    public void setPatientInstructions(String patientInstructions) { this.patientInstructions = patientInstructions; }

    public Boolean getIsStat() { return isStat != null ? isStat : false; }
    public void setIsStat(Boolean isStat) { this.isStat = isStat; }

    public Boolean getIsPrn() { return isPrn != null ? isPrn : false; }
    public void setIsPrn(Boolean isPrn) { this.isPrn = isPrn; }

    public String getPrnIndication() { return prnIndication; }
    public void setPrnIndication(String prnIndication) { this.prnIndication = prnIndication; }

    public Integer getPrnMinIntervalHours() { return prnMinIntervalHours; }
    public void setPrnMinIntervalHours(Integer prnMinIntervalHours) { this.prnMinIntervalHours = prnMinIntervalHours; }

    public Integer getPrnMaxDailyDoses() { return prnMaxDailyDoses; }
    public void setPrnMaxDailyDoses(Integer prnMaxDailyDoses) { this.prnMaxDailyDoses = prnMaxDailyDoses; }

    public String getAdministrationTimes() { return administrationTimes; }
    public void setAdministrationTimes(String administrationTimes) { this.administrationTimes = administrationTimes; }

    public String getTakeHomeQuantity() { return takeHomeQuantity; }
    public void setTakeHomeQuantity(String takeHomeQuantity) { this.takeHomeQuantity = takeHomeQuantity; }

    public Integer getRefillCount() { return refillCount != null ? refillCount : 0; }
    public void setRefillCount(Integer refillCount) { this.refillCount = refillCount; }

    public String getOrderType() { return orderType != null ? orderType : "INPATIENT"; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public String getStatus() { return status != null ? status : "ACTIVE"; }
    public void setStatus(String status) { this.status = status; }

    public String getDiscontinueReason() { return discontinueReason; }
    public void setDiscontinueReason(String discontinueReason) { this.discontinueReason = discontinueReason; }

    public LocalDateTime getDiscontinuedAt() { return discontinuedAt; }
    public void setDiscontinuedAt(LocalDateTime discontinuedAt) { this.discontinuedAt = discontinuedAt; }

    public String getDiscontinuedBy() { return discontinuedBy; }
    public void setDiscontinuedBy(String discontinuedBy) { this.discontinuedBy = discontinuedBy; }

    public String getHoldReason() { return holdReason; }
    public void setHoldReason(String holdReason) { this.holdReason = holdReason; }

    public String getIvInfusionRate() { return ivInfusionRate; }
    public void setIvInfusionRate(String ivInfusionRate) { this.ivInfusionRate = ivInfusionRate; }

    public String getIvDiluent() { return ivDiluent; }
    public void setIvDiluent(String ivDiluent) { this.ivDiluent = ivDiluent; }

    public String getReconciliationStatus() { return reconciliationStatus; }
    public void setReconciliationStatus(String reconciliationStatus) { this.reconciliationStatus = reconciliationStatus; }
}
