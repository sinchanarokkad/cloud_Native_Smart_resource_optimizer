package com.optimizer.metrics.controller;

import com.optimizer.metrics.model.Metric;
import com.optimizer.metrics.service.MetricService;
import com.optimizer.metrics.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/metrics")
public class MetricController {

    @Autowired
    private MetricService metricService;

    @PostMapping("/collect")
    public ResponseEntity<ApiResponse> collectMetric(@RequestBody Metric metric) {
        return ResponseEntity.ok(ApiResponse.success(metricService.collectMetric(metric)));
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<ApiResponse> getMetrics(@PathVariable String resourceId) {
        List<Metric> list = metricService.getMetricsByResourceId(resourceId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse> getResources() {
        return ResponseEntity.ok(ApiResponse.success(metricService.getDistinctResourceIds()));
    }
}
