package com.optimizer.engine.service;

import com.optimizer.engine.model.Recommendation;
import com.optimizer.engine.repository.RecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OptimizationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    public Recommendation generateRecommendation(Map<String, Object> usageData) {
        String resourceId = (String) usageData.get("resourceId");
        Double avgCpu = toDouble(usageData.get("avgCpu"));
        Double avgMemory = toDouble(usageData.get("avgMemory"));
        Integer idleHours = toInteger(usageData.get("idleHours"));

        Recommendation recommendation = new Recommendation();
        recommendation.setResourceId(resourceId);
        recommendation.setCreatedAt(LocalDateTime.now());
        recommendation.setStatus("PENDING");

        if (idleHours != null && idleHours > 24 * 14) {
            recommendation.setRecommendationType("TERMINATE");
            recommendation.setDescription("Resource idle for more than 14 days.");
            recommendation.setConfidence(0.95);
        } else if (avgCpu != null && avgCpu < 20.0) {
            recommendation.setRecommendationType("DOWNSCALE");
            recommendation.setDescription("Average CPU usage is below 20%.");
            recommendation.setConfidence(0.80);
        } else if (avgMemory != null && avgMemory > 80.0) {
            recommendation.setRecommendationType("UPSCALE");
            recommendation.setDescription("Average Memory usage is above 80%.");
            recommendation.setConfidence(0.70);
        } else {
            return null;
        }

        return recommendationRepository.save(recommendation);
    }

    public List<Recommendation> getRecommendations(String resourceId) {
        return recommendationRepository.findByResourceId(resourceId);
    }

    public Recommendation getLatest() {
        return recommendationRepository.findTopByOrderByCreatedAtDesc();
    }

    private Double toDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String s) {
            try {
                return Double.parseDouble(s);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String s) {
            try {
                return Integer.parseInt(s);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
