package com.example.demo.repository;

import com.example.demo.document.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {

    List<PaymentTransaction> findByClerkIdOrderByTransactionDateTimeDesc(String clerkId);
}
