package com.optimizer.cost.controller;

import com.optimizer.cost.calculator.CostCalculatorService;
import com.optimizer.cost.model.CostSimulationHistory;
import com.optimizer.cost.repository.CostSimulationHistoryRepository;
import com.optimizer.cost.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/cost")
public class CostController {

    @Autowired
    private CostCalculatorService costCalculatorService;
    @Autowired
    private CostSimulationHistoryRepository historyRepository;

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse> simulate(@RequestBody CostCalculatorService.CostSimulationRequest request) {
        CostCalculatorService.CostSimulationResult result = costCalculatorService.simulateCost(request);
        CostSimulationHistory h = new CostSimulationHistory();
        h.setAction(request.getAction());
        h.setCurrentInstanceType(request.getCurrentInstanceType());
        h.setRecommendedInstanceType(request.getRecommendedInstanceType());
        h.setCurrentMonthlyCost(result.getCurrentMonthlyCost());
        h.setProjectedMonthlyCost(result.getProjectedMonthlyCost());
        h.setMonthlySavings(result.getMonthlySavings());
        h.setSavingsPercentage(result.getSavingsPercentage());
        h.setCreatedAt(java.time.LocalDateTime.now());
        historyRepository.save(h);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/whatif")
    public ResponseEntity<ApiResponse> whatIf(@RequestBody WhatIfRequest request) {
        List<WhatIfResult> results = new ArrayList<>();
        for (String candidate : request.getCandidates()) {
            CostCalculatorService.CostSimulationRequest req = new CostCalculatorService.CostSimulationRequest();
            req.setCurrentInstanceType(request.getCurrentInstanceType());
            req.setRecommendedInstanceType(candidate);
            req.setAction(request.getAction());
            CostCalculatorService.CostSimulationResult r = costCalculatorService.simulateCost(req);
            WhatIfResult w = new WhatIfResult();
            w.setRecommendedInstanceType(candidate);
            w.setResult(r);
            results.add(w);
        }
        results.sort(Comparator.comparingDouble(a -> -a.getResult().getMonthlySavings()));
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/history/summary")
    public ResponseEntity<ApiResponse> historySummary() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        double totalSavings = historyRepository.findByCreatedAtAfter(since).stream()
                .mapToDouble(h -> h.getMonthlySavings() != null ? h.getMonthlySavings() : 0.0)
                .sum();
        return ResponseEntity.ok(ApiResponse.success(new Summary(totalSavings)));
    }

    public static class Summary {
        private double totalSavings;
        public Summary(double totalSavings) { this.totalSavings = totalSavings; }
        public double getTotalSavings() { return totalSavings; }
        public void setTotalSavings(double v) { this.totalSavings = v; }
    }

    public static class WhatIfRequest {
        private String currentInstanceType;
        private List<String> candidates;
        private String action;
        public String getCurrentInstanceType() { return currentInstanceType; }
        public void setCurrentInstanceType(String v) { this.currentInstanceType = v; }
        public List<String> getCandidates() { return candidates; }
        public void setCandidates(List<String> v) { this.candidates = v; }
        public String getAction() { return action; }
        public void setAction(String v) { this.action = v; }
    }

    public static class WhatIfResult {
        private String recommendedInstanceType;
        private CostCalculatorService.CostSimulationResult result;
        public String getRecommendedInstanceType() { return recommendedInstanceType; }
        public void setRecommendedInstanceType(String v) { this.recommendedInstanceType = v; }
        public CostCalculatorService.CostSimulationResult getResult() { return result; }
        public void setResult(CostCalculatorService.CostSimulationResult v) { this.result = v; }
    }
}
