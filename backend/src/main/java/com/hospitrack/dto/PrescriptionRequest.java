package com.hospitrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class PrescriptionRequest {

    private String visitId;

    @NotBlank(message = "Patient ID is required.")
    private String patientId;

    private String doctorId;
    private String hospitalId;
    private String orderType = "INPATIENT"; // INPATIENT, DISCHARGE
    private String instructions;

    @NotEmpty(message = "Prescription must contain at least one medicine item.")
    private List<MedicineItemDto> medicines;

    private String clinicalOverrideReason;
    private Boolean overrideConfirmed = false;

    public PrescriptionRequest() {}

    public static class MedicineItemDto {
        @NotBlank(message = "Medicine name is required.")
        private String name;
        private String brandName;
        private String drugCategory;
        @NotBlank(message = "Dosage is required.")
        private String dosage;
        private String dosageForm = "Tablet";
        @NotBlank(message = "Frequency is required.")
        private String frequency;
        private String route = "Oral";
        private String mealTiming;
        private String duration;
        private String instructions;
        private String patientInstructions;

        private Boolean isStat = false;
        private Boolean isPrn = false;
        private String prnIndication;
        private Integer prnMinIntervalHours;
        private Integer prnMaxDailyDoses;
        private String administrationTimes;

        private String takeHomeQuantity;
        private Integer refillCount = 0;
        private String orderType = "INPATIENT";
        private String status = "ACTIVE";

        private String ivInfusionRate;
        private String ivDiluent;
        private String reconciliationStatus;

        public MedicineItemDto() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getBrandName() { return brandName; }
        public void setBrandName(String brandName) { this.brandName = brandName; }

        public String getDrugCategory() { return drugCategory; }
        public void setDrugCategory(String drugCategory) { this.drugCategory = drugCategory; }

        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }

        public String getDosageForm() { return dosageForm != null ? dosageForm : "Tablet"; }
        public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }

        public String getRoute() { return route != null ? route : "Oral"; }
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

        public String getIvInfusionRate() { return ivInfusionRate; }
        public void setIvInfusionRate(String ivInfusionRate) { this.ivInfusionRate = ivInfusionRate; }

        public String getIvDiluent() { return ivDiluent; }
        public void setIvDiluent(String ivDiluent) { this.ivDiluent = ivDiluent; }

        public String getReconciliationStatus() { return reconciliationStatus; }
        public void setReconciliationStatus(String reconciliationStatus) { this.reconciliationStatus = reconciliationStatus; }
    }

    public String getVisitId() { return visitId; }
    public void setVisitId(String visitId) { this.visitId = visitId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public String getOrderType() { return orderType != null ? orderType : "INPATIENT"; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public List<MedicineItemDto> getMedicines() { return medicines; }
    public void setMedicines(List<MedicineItemDto> medicines) { this.medicines = medicines; }

    public String getClinicalOverrideReason() { return clinicalOverrideReason; }
    public void setClinicalOverrideReason(String clinicalOverrideReason) { this.clinicalOverrideReason = clinicalOverrideReason; }

    public Boolean getOverrideConfirmed() { return overrideConfirmed != null ? overrideConfirmed : false; }
    public void setOverrideConfirmed(Boolean overrideConfirmed) { this.overrideConfirmed = overrideConfirmed; }
}
