package com.example.demo.controller;

import com.example.demo.dto.UserCreditsDTO;
import com.example.demo.service.ProfileService;
import com.example.demo.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserCreditsController {

    private final UserCreditsService userCreditsService;
    private final ProfileService profileService;

    @GetMapping("/credits")
    public UserCreditsDTO getCredits() {
        String clerkId = profileService.getCurrentProfile().getClerkId();
        var uc = userCreditsService.getUserCredits(clerkId);
        return UserCreditsDTO.builder()
                .credits(uc.getCredits())
                .plan(uc.getPlan())
                .build();
    }
}
