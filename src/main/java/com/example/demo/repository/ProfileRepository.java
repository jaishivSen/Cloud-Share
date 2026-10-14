package com.example.demo.repository;

import com.example.demo.document.ProfileDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProfileRepository extends MongoRepository<ProfileDocument, String> {

    Optional<ProfileDocument> findByClerkId(String clerkId);

    boolean existsByClerkId(String clerkId);
}
