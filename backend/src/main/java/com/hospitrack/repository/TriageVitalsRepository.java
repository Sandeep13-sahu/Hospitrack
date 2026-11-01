package com.hospitrack.repository;

import com.hospitrack.entity.TriageVitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageVitalsRepository extends JpaRepository<TriageVitals, String> {
    List<TriageVitals> findByPatientIdOrderByRecordedAtDesc(String patientId);
    Optional<TriageVitals> findFirstByPatientIdOrderByRecordedAtDesc(String patientId);
    List<TriageVitals> findByHospitalId(String hospitalId);
    void deleteByPatientId(String patientId);
}

