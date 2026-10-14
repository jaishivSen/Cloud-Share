package com.example.demo.controller;

import com.example.demo.dto.PaymentDTO;
import com.example.demo.dto.PaymentVerificationDTO;
import com.example.demo.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public PaymentDTO createOrder(@RequestBody PaymentDTO dto) {
        return paymentService.createOrder(dto);
    }

    @PostMapping("/verify-payment")
    public PaymentDTO verify(@RequestBody PaymentVerificationDTO dto) {
        return paymentService.verifyPayment(dto);
    }
}
