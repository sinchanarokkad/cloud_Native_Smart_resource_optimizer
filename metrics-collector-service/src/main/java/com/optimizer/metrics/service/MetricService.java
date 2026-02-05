package com.optimizer.metrics.service;

import com.optimizer.metrics.model.Metric;
import com.optimizer.metrics.repository.MetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
public class MetricService {

    @Autowired
    private MetricRepository metricRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    public Metric collectMetric(Metric metric) {
        if (metric.getTimestamp() == null) {
            metric.setTimestamp(LocalDateTime.now());
        }
        return metricRepository.save(metric);
    }

    public List<Metric> getMetricsByResourceId(String resourceId) {
        return metricRepository.findByResourceId(resourceId);
    }

    public List<String> getDistinctResourceIds() {
        return mongoTemplate.findDistinct(new Query(), "resourceId", Metric.class, String.class);
    }
}
