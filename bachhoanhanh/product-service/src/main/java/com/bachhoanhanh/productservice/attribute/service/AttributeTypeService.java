package com.bachhoanhanh.productservice.attribute.service;

import com.bachhoanhanh.productservice.attribute.model.AttributeDataType;
import com.bachhoanhanh.productservice.attribute.model.AttributeType;
import com.bachhoanhanh.productservice.attribute.repository.AttributeTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@CacheConfig(cacheNames = "attributeTypes")
public class AttributeTypeService {

    private final AttributeTypeRepository attributeTypeRepository;

    @Cacheable(key = "'all'")
    @Transactional(readOnly = true)
    public List<AttributeType> getAll() {
        return attributeTypeRepository.findAll();
    }

    @Cacheable(key = "#name")
    @Transactional(readOnly = true)
    public AttributeType getByName(String name) {
        return attributeTypeRepository.findById(name)
                .orElseThrow(() -> new EntityNotFoundException("AttributeType not found: " + name));
    }

    // exists() KHÔNG cache — gọi nhiều với key khác nhau, cache sẽ phình to
    // và stale data ở đây gây bug nghiêm trọng hơn là chậm
    @Transactional(readOnly = true)
    public boolean exists(String name) {
        return attributeTypeRepository.existsById(name);
    }

    @CacheEvict(allEntries = true)
    @Transactional
    public AttributeType create(String name, AttributeDataType dataType) {
        if (attributeTypeRepository.existsById(name)) {
            throw new IllegalArgumentException("AttributeType already exists: " + name);
        }
        return attributeTypeRepository.save(new AttributeType(name, dataType));
    }

    @CacheEvict(allEntries = true)
    @Transactional
    public void delete(String name) {
        if (!attributeTypeRepository.existsById(name)) {
            throw new EntityNotFoundException("AttributeType not found: " + name);
        }
        attributeTypeRepository.deleteById(name);
    }
    public AttributeType findOrCreate(String typeName) {
        return attributeTypeRepository.findByName(typeName)
                .orElseGet(() -> {
                    AttributeType newType = new AttributeType();
                    newType.setName(typeName);
                    return attributeTypeRepository.save(newType);
                });
    }
}