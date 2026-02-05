package com.optimizer.cost.calculator;

import com.optimizer.cost.pricing.PricingService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CostCalculatorService {

    @Autowired
    private PricingService pricingService;

    @Data
    public static class CostSimulationRequest {
        private String currentInstanceType;
        private String recommendedInstanceType;
        private String action; // UPSCALE, DOWNSCALE, TERMINATE
    }

    @Data
    public static class CostSimulationResult {
        private Double currentMonthlyCost;
        private Double projectedMonthlyCost;
        private Double monthlySavings;
        private Double savingsPercentage;
    }

    public CostSimulationResult simulateCost(CostSimulationRequest request) {
        Double currentRate = pricingService.getHourlyRate(request.getCurrentInstanceType());
        Double projectedRate = 0.0;

        if ("TERMINATE".equalsIgnoreCase(request.getAction())) {
            projectedRate = 0.0;
        } else {
            projectedRate = pricingService.getHourlyRate(request.getRecommendedInstanceType());
        }

        Double currentMonthlyCost = currentRate * 24 * 30;
        Double projectedMonthlyCost = projectedRate * 24 * 30;
        Double savings = currentMonthlyCost - projectedMonthlyCost;
        Double percentage = (currentMonthlyCost > 0) ? (savings / currentMonthlyCost) * 100 : 0.0;

        CostSimulationResult result = new CostSimulationResult();
        result.setCurrentMonthlyCost(currentMonthlyCost);
        result.setProjectedMonthlyCost(projectedMonthlyCost);
        result.setMonthlySavings(savings);
        result.setSavingsPercentage(percentage);
        
        return result;
    }
}
