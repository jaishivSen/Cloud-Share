package com.example.demo.controller;

import com.example.demo.document.PaymentTransaction;
import com.example.demo.document.ProfileDocument;
import com.example.demo.repository.PaymentTransactionRepository;
import com.example.demo.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionsController {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ProfileService profileService;

    @GetMapping
    public List<PaymentTransaction> getMyTransactions() {
        ProfileDocument profile = profileService.getCurrentProfile();
        return paymentTransactionRepository.findByClerkIdOrderByTransactionDateTimeDesc(profile.getClerkId());
    }
}
