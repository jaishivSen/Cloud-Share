package com.example.demo.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDTO {

    private String planId;
    private Integer amount;
    private String currency;
    private Integer credits;
    private Boolean success;
    private String message;
    private String orderId;
}
