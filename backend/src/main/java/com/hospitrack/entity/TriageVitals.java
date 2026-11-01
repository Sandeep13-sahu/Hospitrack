package com.hospitrack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "triage_vitals", indexes = {
    @Index(name = "idx_triage_vitals_patient_id", columnList = "patient_id"),
    @Index(name = "idx_triage_vitals_recorded_at", columnList = "recorded_at"),
    @Index(name = "idx_triage_vitals_hospital_id", columnList = "hospital_id")
})
public class TriageVitals {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 64)
    private String patientId;

    @Column(name = "recorded_by_id", length = 64)
    private String recordedById;

    @Column(name = "recorded_by_name", length = 128)
    private String recordedByName;

    @Column(name = "hospital_id", length = 64)
    private String hospitalId;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;

    @Column(name = "body_temperature")
    private Double bodyTemperature;

    @Column(name = "rhythm_notes", length = 255)
    private String rhythmNotes;

    @Column(name = "intake_source", length = 64)
    private String intakeSource = "RECEPTION_ADMISSION";

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public TriageVitals() {}

    public TriageVitals(
            String id,
            String patientId,
            String recordedById,
            String recordedByName,
            String hospitalId,
            Integer bloodPressureSystolic,
            Integer bloodPressureDiastolic,
            Integer heartRate,
            Integer oxygenSaturation,
            Double bodyTemperature,
            String rhythmNotes,
            String intakeSource
    ) {
        this.id = id;
        this.patientId = patientId;
        this.recordedById = recordedById;
        this.recordedByName = recordedByName;
        this.hospitalId = hospitalId;
        this.bloodPressureSystolic = bloodPressureSystolic;
        this.bloodPressureDiastolic = bloodPressureDiastolic;
        this.heartRate = heartRate;
        this.oxygenSaturation = oxygenSaturation;
        this.bodyTemperature = bodyTemperature;
        this.rhythmNotes = rhythmNotes;
        this.intakeSource = intakeSource != null ? intakeSource : "RECEPTION_ADMISSION";
        this.recordedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getRecordedById() { return recordedById; }
    public void setRecordedById(String recordedById) { this.recordedById = recordedById; }

    public String getRecordedByName() { return recordedByName; }
    public void setRecordedByName(String recordedByName) { this.recordedByName = recordedByName; }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public Integer getBloodPressureSystolic() { return bloodPressureSystolic; }
    public void setBloodPressureSystolic(Integer bloodPressureSystolic) { this.bloodPressureSystolic = bloodPressureSystolic; }

    public Integer getBloodPressureDiastolic() { return bloodPressureDiastolic; }
    public void setBloodPressureDiastolic(Integer bloodPressureDiastolic) { this.bloodPressureDiastolic = bloodPressureDiastolic; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Integer getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(Integer oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }

    public Double getBodyTemperature() { return bodyTemperature; }
    public void setBodyTemperature(Double bodyTemperature) { this.bodyTemperature = bodyTemperature; }

    public String getRhythmNotes() { return rhythmNotes; }
    public void setRhythmNotes(String rhythmNotes) { this.rhythmNotes = rhythmNotes; }

    public String getIntakeSource() { return intakeSource; }
    public void setIntakeSource(String intakeSource) { this.intakeSource = intakeSource; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }

    @Transient
    public String getFormattedBloodPressure() {
        if (bloodPressureSystolic != null && bloodPressureDiastolic != null) {
            return bloodPressureSystolic + "/" + bloodPressureDiastolic;
        }
        return null;
    }
}

