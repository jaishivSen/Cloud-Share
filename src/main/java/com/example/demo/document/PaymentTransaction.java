package com.example.demo.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payment_transactions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    private String id;

    private String clerkId;
    private String userEmail;
    private String userName;

    private String orderId;
    private String paymentId;
    private String planId;

    private Integer amount;
    private String currency;
    private Integer creditsAdded;

    private String status; // PENDING, SUCCESS, FAILED, ERROR
    private LocalDateTime transactionDateTime;
}
