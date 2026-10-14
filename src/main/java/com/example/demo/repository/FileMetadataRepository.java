package com.example.demo.repository;

import com.example.demo.document.FileMetadataDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FileMetadataRepository extends MongoRepository<FileMetadataDocument, String> {

    List<FileMetadataDocument> findByClerkId(String clerkId);
}
