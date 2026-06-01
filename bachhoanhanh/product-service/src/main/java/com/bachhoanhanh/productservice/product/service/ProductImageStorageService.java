package com.bachhoanhanh.productservice.product.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );
    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final String KEY_PREFIX = "products/";

    private final S3Client s3Client;
    private final String bucket;
    private final String region;
    private final String publicBaseUrl;

    public ProductImageStorageService(
            S3Client s3Client,
            @Value("${app.media.s3.bucket}") String bucket,
            @Value("${app.media.s3.region}") String region,
            @Value("${app.media.s3.public-base-url}") String publicBaseUrl
    ) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.region = region;
        this.publicBaseUrl = normalizeBaseUrl(publicBaseUrl);
    }

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        validate(file);

        String key = KEY_PREFIX + UUID.randomUUID() + extensionOf(file.getOriginalFilename(), file.getContentType());
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return publicUrlFor(key);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read product image", e);
        }
    }

    public void deleteIfManaged(String imageUrl) {
        String key = keyFromManagedUrl(imageUrl);
        if (key == null) {
            return;
        }
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
    }

    private void validate(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Product image must be 5MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Product image must be JPEG, PNG, WEBP, or GIF");
        }
    }

    private String publicUrlFor(String key) {
        if (StringUtils.hasText(publicBaseUrl)) {
            return publicBaseUrl + "/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    private String keyFromManagedUrl(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return null;
        }
        try {
            URI uri = URI.create(imageUrl);
            String path = uri.getPath();
            if (path == null || path.length() <= 1) {
                return null;
            }
            String key = path.substring(1);
            if (!key.startsWith(KEY_PREFIX)) {
                return null;
            }

            String host = uri.getHost();
            if (host == null) {
                return null;
            }
            String defaultHost = bucket + ".s3." + region + ".amazonaws.com";
            boolean isDefaultBucketHost = host.equals(defaultHost);
            boolean isCustomPublicHost = StringUtils.hasText(publicBaseUrl) && imageUrl.startsWith(publicBaseUrl + "/");
            return isDefaultBucketHost || isCustomPublicHost ? key : null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String extensionOf(String filename, String contentType) {
        String extension = StringUtils.getFilenameExtension(filename);
        if (StringUtils.hasText(extension)) {
            return "." + extension.toLowerCase(Locale.ROOT);
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private String normalizeBaseUrl(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
