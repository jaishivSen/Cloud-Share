package com.example.demo.service;

import com.example.demo.document.ProfileDocument;
import com.example.demo.dto.ProfileDTO;
import com.example.demo.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileDocument getCurrentProfile() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new RuntimeException("User not authenticated");
        }

        String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();

        return profileRepository
                .findByClerkId(clerkId)
                .orElseGet(() -> createDefaultProfile(clerkId));
    }

    private ProfileDocument createDefaultProfile(String clerkId) {
        ProfileDocument profile = ProfileDocument.builder()
                .clerkId(clerkId)
                .credits(5)
                .createdAt(Instant.now())
                .build();

        return profileRepository.save(profile);
    }

    public ProfileDTO toDTO(ProfileDocument profile) {
        return ProfileDTO.builder()
                .id(profile.getId())
                .clerkId(profile.getClerkId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .credits(profile.getCredits())
                .photoUrl(profile.getPhotoUrl())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
