package com.example.demo.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCreditsDTO {
    private Integer credits;
    private String plan;
}
