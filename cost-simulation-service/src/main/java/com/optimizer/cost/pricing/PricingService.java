package com.optimizer.cost.pricing;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class PricingService {
    
    private final Map<String, Double> hourlyRates = new HashMap<>();

    public PricingService() {
        // Mock Pricing (USD per hour)
        hourlyRates.put("t2.micro", 0.0116);
        hourlyRates.put("t2.small", 0.023);
        hourlyRates.put("t2.medium", 0.0464);
        hourlyRates.put("m5.large", 0.096);
        hourlyRates.put("m5.xlarge", 0.192);
    }

    public Double getHourlyRate(String instanceType) {
        return hourlyRates.getOrDefault(instanceType, 0.0);
    }
}
