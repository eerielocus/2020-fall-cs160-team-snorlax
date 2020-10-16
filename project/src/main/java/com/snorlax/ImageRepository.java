package com.uploader.aight;

import org.springframework.data.repository.CrudRepository;

// magic CRUD operations
public interface ImageRepository extends CrudRepository<Image, String> {

}
