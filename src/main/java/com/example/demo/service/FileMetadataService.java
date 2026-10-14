package com.example.demo.service;

import com.example.demo.document.FileMetadataDocument;
import com.example.demo.document.ProfileDocument;
import com.example.demo.dto.FileMetadataDTO;
import com.example.demo.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileMetadataService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final FileMetadataRepository fileMetadataRepository;

    private final Path uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();

    public List<FileMetadataDTO> uploadFiles(MultipartFile[] files) throws IOException {
        ProfileDocument currentProfile = profileService.getCurrentProfile();

        if (!userCreditsService.hasEnoughCredits(files.length)) {
            throw new RuntimeException("Not enough credits. Please buy more.");
        }

        Files.createDirectories(uploadRoot);

        List<FileMetadataDocument> saved =
                java.util.Arrays.stream(files)
                        .map(file -> {
                            try {
                                String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
                                String randomName = UUID.randomUUID() + (ext != null ? "." + ext : "");
                                Path target = uploadRoot.resolve(randomName);

                                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                                userCreditsService.consumeCredit();

                                FileMetadataDocument doc = FileMetadataDocument.builder()
                                        .fileLocation(target.toString())
                                        .name(file.getOriginalFilename())
                                        .size(file.getSize())
                                        .type(file.getContentType())
                                        .clerkId(currentProfile.getClerkId())
                                        .isPublic(false)
                                        .uploadedAt(LocalDateTime.now())
                                        .build();

                                return fileMetadataRepository.save(doc);
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            }
                        })
                        .collect(Collectors.toList());

        return saved.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FileMetadataDTO> getMyFiles() {
        ProfileDocument current = profileService.getCurrentProfile();
        return fileMetadataRepository.findByClerkId(current.getClerkId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public FileMetadataDTO getPublicFile(String id) {
        FileMetadataDocument doc = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        if (!Boolean.TRUE.equals(doc.getIsPublic())) {
            throw new RuntimeException("File is not public");
        }
        return toDTO(doc);
    }

    public FileMetadataDocument getFileForDownload(String id) {
        return fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }

    public void deleteFile(String id) {
        ProfileDocument current = profileService.getCurrentProfile();
        FileMetadataDocument doc = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!doc.getClerkId().equals(current.getClerkId())) {
            throw new RuntimeException("File does not belong to current user");
        }

        try {
            Files.deleteIfExists(Paths.get(doc.getFileLocation()));
        } catch (IOException e) {
            // ignore delete errors
        }

        fileMetadataRepository.deleteById(id);
    }

    public FileMetadataDTO togglePublic(String id) {
        FileMetadataDocument doc = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        doc.setIsPublic(!Boolean.TRUE.equals(doc.getIsPublic()));
        fileMetadataRepository.save(doc);
        return toDTO(doc);
    }

    public FileMetadataDTO toDTO(FileMetadataDocument doc) {
        return FileMetadataDTO.builder()
                .id(doc.getId())
                .name(doc.getName())
                .type(doc.getType())
                .size(doc.getSize())
                .clerkId(doc.getClerkId())
                .isPublic(doc.getIsPublic())
                .fileLocation(doc.getFileLocation())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
