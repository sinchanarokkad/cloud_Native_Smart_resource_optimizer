package com.optimizer.metrics.repository;

import com.optimizer.metrics.model.Metric;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetricRepository extends MongoRepository<Metric, String> {
    List<Metric> findByResourceId(String resourceId);
}
