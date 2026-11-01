package com.hospitrack.dto;

import com.hospitrack.entity.AccountStatus;
import com.hospitrack.entity.Role;

import java.time.LocalDateTime;

public class UserDiagnosticDto {

    private String id;
    private String name;
    private String email;
    private Role role;
    private AccountStatus status;
    private boolean validBcryptHash;
    private boolean profileLinked;
    private String profileType;
    private String profileId;
    private String hospitalId;
    private boolean emailVerified;
    private LocalDateTime createdAt;

    public UserDiagnosticDto() {}

    public UserDiagnosticDto(
            String id,
            String name,
            String email,
            Role role,
            AccountStatus status,
            boolean validBcryptHash,
            boolean profileLinked,
            String profileType,
            String profileId,
            String hospitalId,
            boolean emailVerified,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.validBcryptHash = validBcryptHash;
        this.profileLinked = profileLinked;
        this.profileType = profileType;
        this.profileId = profileId;
        this.hospitalId = hospitalId;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }

    public boolean isValidBcryptHash() { return validBcryptHash; }
    public void setValidBcryptHash(boolean validBcryptHash) { this.validBcryptHash = validBcryptHash; }

    public boolean isProfileLinked() { return profileLinked; }
    public void setProfileLinked(boolean profileLinked) { this.profileLinked = profileLinked; }

    public String getProfileType() { return profileType; }
    public void setProfileType(String profileType) { this.profileType = profileType; }

    public String getProfileId() { return profileId; }
    public void setProfileId(String profileId) { this.profileId = profileId; }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

