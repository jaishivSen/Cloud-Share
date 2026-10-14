package com.example.demo.service;

import com.example.demo.document.UserCredits;
import com.example.demo.repository.UserCreditsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserCreditsService {

    private final UserCreditsRepository userCreditsRepository;
    private final ProfileService profileService;

    public UserCredits getUserCredits(String clerkId) {
        return userCreditsRepository.findByClerkId(clerkId)
                .orElseGet(() -> createInitialCredits(clerkId));
    }

    public UserCredits getCurrentUserCredits() {
        String clerkId = profileService.getCurrentProfile().getClerkId();
        return getUserCredits(clerkId);
    }

    public UserCredits createInitialCredits(String clerkId) {
        UserCredits uc = UserCredits.builder()
                .clerkId(clerkId)
                .credits(5)
                .plan("BASIC")
                .build();
        return userCreditsRepository.save(uc);
    }

    public boolean hasEnoughCredits(int required) {
        UserCredits uc = getCurrentUserCredits();
        return uc.getCredits() >= required;
    }

    public UserCredits consumeCredit() {
        UserCredits uc = getCurrentUserCredits();
        if (uc.getCredits() <= 0) {
            throw new RuntimeException("Not enough credits");
        }
        uc.setCredits(uc.getCredits() - 1);
        return userCreditsRepository.save(uc);
    }

    public UserCredits addCredits(String clerkId, int creditsToAdd, String plan) {
        UserCredits uc = getUserCredits(clerkId);
        uc.setCredits(uc.getCredits() + creditsToAdd);
        uc.setPlan(plan);
        return userCreditsRepository.save(uc);
    }
}
