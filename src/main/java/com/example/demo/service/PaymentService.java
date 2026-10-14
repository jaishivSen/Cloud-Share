package com.example.demo.service;

import com.example.demo.document.PaymentTransaction;
import com.example.demo.document.ProfileDocument;
import com.example.demo.dto.PaymentDTO;
import com.example.demo.dto.PaymentVerificationDTO;
import com.example.demo.repository.PaymentTransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentDTO createOrder(PaymentDTO dto) {
        try {
            ProfileDocument profile = profileService.getCurrentProfile();
            String clerkId = profile.getClerkId();

            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", dto.getAmount());
            orderRequest.put("currency", dto.getCurrency());
            orderRequest.put("receipt", "order_" + System.currentTimeMillis());

            Order order = client.orders.create(orderRequest);
            String orderId = order.get("id");

            PaymentTransaction tx = PaymentTransaction.builder()
                    .clerkId(clerkId)
                    .orderId(orderId)
                    .planId(dto.getPlanId())
                    .amount(dto.getAmount())
                    .currency(dto.getCurrency())
                    .status("PENDING")
                    .transactionDateTime(LocalDateTime.now())
                    .userEmail(profile.getEmail())
                    .userName(profile.getFirstName() + " " + profile.getLastName())
                    .build();

            paymentTransactionRepository.save(tx);

            return PaymentDTO.builder()
                    .orderId(orderId)
                    .success(true)
                    .message("Order created successfully")
                    .build();

        } catch (Exception e) {
            return PaymentDTO.builder()
                    .success(false)
                    .message("Error creating order: " + e.getMessage())
                    .build();
        }
    }

    public PaymentDTO verifyPayment(PaymentVerificationDTO req) {
        try {
            ProfileDocument profile = profileService.getCurrentProfile();
            String clerkId = profile.getClerkId();

            String data = req.getRazorpay_order_id() + "|" + req.getRazorpay_payment_id();
            String generatedSignature =
                    hmacSha256(data, razorpayKeySecret);

            if (!generatedSignature.equals(req.getRazorpay_signature())) {
                updateTx(req.getRazorpay_order_id(), "FAILED", req.getRazorpay_payment_id(), null);
                return PaymentDTO.builder()
                        .success(false)
                        .message("Signature verification failed")
                        .build();
            }

            int creditsToAdd = 0;
            String plan = "BASIC";

            switch (req.getPlanId()) {
                case "premium":
                    creditsToAdd = 500;
                    plan = "PREMIUM";
                    break;
                case "ultimate":
                    creditsToAdd = 5000;
                    plan = "ULTIMATE";
                    break;
            }

            if (creditsToAdd <= 0) {
                updateTx(req.getRazorpay_order_id(), "FAILED", req.getRazorpay_payment_id(), null);
                return PaymentDTO.builder()
                        .success(false)
                        .message("Invalid plan")
                        .build();
            }

            userCreditsService.addCredits(clerkId, creditsToAdd, plan);
            updateTx(req.getRazorpay_order_id(), "SUCCESS", req.getRazorpay_payment_id(), creditsToAdd);

            return PaymentDTO.builder()
                    .success(true)
                    .message("Payment verified and credits added")
                    .credits(userCreditsService.getUserCredits(clerkId).getCredits())
                    .build();

        } catch (Exception e) {
            updateTx(req.getRazorpay_order_id(), "ERROR", req.getRazorpay_payment_id(), null);
            return PaymentDTO.builder()
                    .success(false)
                    .message("Error verifying payment: " + e.getMessage())
                    .build();
        }
    }

    private String hmacSha256(String data, String secret) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(keySpec);
        byte[] hmacData = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : hmacData) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }

    private void updateTx(String orderId, String status, String paymentId, Integer creditsAdded) {
        paymentTransactionRepository.findAll().stream()
                .filter(t -> orderId.equals(t.getOrderId()))
                .findFirst()
                .ifPresent(tx -> {
                    tx.setStatus(status);
                    tx.setPaymentId(paymentId);
                    if (creditsAdded != null) {
                        tx.setCreditsAdded(creditsAdded);
                    }
                    paymentTransactionRepository.save(tx);
                });
    }
}
