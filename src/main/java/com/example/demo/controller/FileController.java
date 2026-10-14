package com.example.demo.controller;

import com.example.demo.document.FileMetadataDocument;
import com.example.demo.dto.FileMetadataDTO;
import com.example.demo.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileMetadataService fileMetadataService;

    @PostMapping("/upload")
    public List<FileMetadataDTO> upload(@RequestParam("files") MultipartFile[] files) throws IOException {
        return fileMetadataService.uploadFiles(files);
    }

    @GetMapping("/my")
    public List<FileMetadataDTO> myFiles() {
        return fileMetadataService.getMyFiles();
    }

    @GetMapping("/public/{id}")
    public FileMetadataDTO publicFile(@PathVariable String id) {
        return fileMetadataService.getPublicFile(id);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<FileSystemResource> download(@PathVariable String id) {
        FileMetadataDocument doc = fileMetadataService.getFileForDownload(id);
        File file = new File(doc.getFileLocation());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = new FileSystemResource(file);
        String encodedName = URLEncoder.encode(doc.getName(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + encodedName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        fileMetadataService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-public")
    public FileMetadataDTO toggle(@PathVariable String id) {
        return fileMetadataService.togglePublic(id);
    }
}
