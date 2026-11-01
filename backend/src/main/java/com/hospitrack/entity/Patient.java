package com.hospitrack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patients_hospital_id", columnList = "current_hospital_id"),
    @Index(name = "idx_patients_doctor_id", columnList = "primary_doctor_id"),
    @Index(name = "idx_patients_email", columnList = "email")
})
public class Patient {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "gender", nullable = false, length = 16)
    private String gender;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "blood_group", length = 8)
    private String bloodGroup;

    @Column(name = "contact", nullable = false, length = 64)
    private String contact;

    @Column(name = "email", length = 191)
    private String email;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "emergency_contact", length = 255)
    private String emergencyContact;

    @Column(name = "emergency_contact_name", length = 128)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 64)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation", length = 64)
    private String emergencyContactRelation;

    @Column(name = "ward", length = 128)
    private String ward;

    @Column(name = "bed_number", length = 64)
    private String bedNumber;

    @Column(name = "current_hospital_id", nullable = false, length = 64)
    private String currentHospitalId;

    @Column(name = "primary_doctor_id", length = 64)
    private String primaryDoctorId;

    @Column(name = "assigned_doctor_id", length = 64)
    private String assignedDoctorId;

    // Intake Triage Telemetry Fields
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

    @Column(name = "triage_recorded_at")
    private LocalDateTime triageRecordedAt;

    @Column(name = "triage_recorded_by", length = 128)
    private String triageRecordedBy;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "CHECKED_IN"; // CHECKED_IN, DISCHARGED, TRANSFER_PENDING, TRANSFERRED

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "admitted_at", nullable = false)
    private LocalDateTime admittedAt = LocalDateTime.now();

    @Column(name = "discharged_at")
    private LocalDateTime dischargedAt;

    @jakarta.persistence.Transient
    private String initialPassword;

    public Patient() {}

    public Patient(String id, String name, String gender, Integer age, String bloodGroup, String contact, String email, String address, String emergencyContact, String currentHospitalId, String primaryDoctorId) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.bloodGroup = bloodGroup;
        this.contact = contact;
        this.email = email != null ? email.toLowerCase().trim() : null;
        this.address = address;
        this.setEmergencyContact(emergencyContact);
        this.currentHospitalId = currentHospitalId;
        this.primaryDoctorId = primaryDoctorId;
        this.status = "CHECKED_IN";
        this.admittedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.toLowerCase().trim() : null; }

    public String getAddress() { return address != null && !address.isBlank() ? address : "Address not provided"; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContact() {
        if (emergencyContact != null && !emergencyContact.isBlank()) {
            return emergencyContact;
        }
        if (emergencyContactName != null || emergencyContactPhone != null) {
            String n = emergencyContactName != null ? emergencyContactName : "Emergency Contact";
            String r = emergencyContactRelation != null ? " (" + emergencyContactRelation + ")" : "";
            String p = emergencyContactPhone != null ? " - " + emergencyContactPhone : "";
            return n + r + p;
        }
        return null;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
        if (emergencyContact != null && (emergencyContactName == null || emergencyContactName.isBlank())) {
            // Attempt smart parse for legacy strings: "+91 98111 99991 (Jane Doe - Spouse)" or "Jane Doe (Spouse) - 98111"
            try {
                if (emergencyContact.contains("(") && emergencyContact.contains(")")) {
                    int start = emergencyContact.indexOf('(');
                    int end = emergencyContact.indexOf(')');
                    String inside = emergencyContact.substring(start + 1, end).trim();
                    String outside = (emergencyContact.substring(0, start) + emergencyContact.substring(end + 1)).trim();
                    if (inside.contains("-")) {
                        String[] parts = inside.split("-", 2);
                        this.emergencyContactName = parts[0].trim();
                        this.emergencyContactRelation = parts[1].trim();
                        this.emergencyContactPhone = outside.replace("-", "").trim();
                    } else {
                        this.emergencyContactRelation = inside;
                        this.emergencyContactName = outside;
                    }
                } else {
                    this.emergencyContactName = emergencyContact;
                }
            } catch (Exception ignored) {}
        }
    }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public String getCurrentHospitalId() { return currentHospitalId; }
    public void setCurrentHospitalId(String currentHospitalId) { this.currentHospitalId = currentHospitalId; }

    public String getPrimaryDoctorId() { return primaryDoctorId; }
    public void setPrimaryDoctorId(String primaryDoctorId) {
        this.primaryDoctorId = primaryDoctorId;
        this.assignedDoctorId = primaryDoctorId;
    }

    public String getAssignedDoctorId() {
        return assignedDoctorId != null ? assignedDoctorId : primaryDoctorId;
    }
    public void setAssignedDoctorId(String assignedDoctorId) {
        this.assignedDoctorId = assignedDoctorId;
        this.primaryDoctorId = assignedDoctorId;
    }

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

    public LocalDateTime getTriageRecordedAt() { return triageRecordedAt; }
    public void setTriageRecordedAt(LocalDateTime triageRecordedAt) { this.triageRecordedAt = triageRecordedAt; }

    public String getTriageRecordedBy() { return triageRecordedBy; }
    public void setTriageRecordedBy(String triageRecordedBy) { this.triageRecordedBy = triageRecordedBy; }

    @Transient
    public String getBloodPressure() {
        if (bloodPressureSystolic != null && bloodPressureDiastolic != null) {
            return bloodPressureSystolic + "/" + bloodPressureDiastolic;
        }
        return null;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAdmittedAt() { return admittedAt; }
    public void setAdmittedAt(LocalDateTime admittedAt) { this.admittedAt = admittedAt; }

    public LocalDateTime getDischargedAt() { return dischargedAt; }
    public void setDischargedAt(LocalDateTime dischargedAt) { this.dischargedAt = dischargedAt; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getInitialPassword() { return initialPassword; }
    public void setInitialPassword(String initialPassword) { this.initialPassword = initialPassword; }
}
