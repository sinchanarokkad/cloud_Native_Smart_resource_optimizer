package com.optimizer.engine.controller;

import com.optimizer.engine.model.Recommendation;
import com.optimizer.engine.service.OptimizationService;
import com.optimizer.engine.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/optimize")
public class OptimizationController {

    @Autowired
    private OptimizationService optimizationService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse> analyze(@RequestBody Map<String, Object> usageData) {
        Recommendation rec = optimizationService.generateRecommendation(usageData);
        return ResponseEntity.ok(ApiResponse.success(rec));
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<ApiResponse> getRecommendations(@PathVariable String resourceId) {
        List<Recommendation> list = optimizationService.getRecommendations(resourceId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse> latest() {
        return ResponseEntity.ok(ApiResponse.success(optimizationService.getLatest()));
    }
}
