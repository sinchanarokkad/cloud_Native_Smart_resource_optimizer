package com.optimizer.cost.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cost_simulation_history")
public class CostSimulationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String action;
    private String currentInstanceType;
    private String recommendedInstanceType;
    private Double currentMonthlyCost;
    private Double projectedMonthlyCost;
    private Double monthlySavings;
    private Double savingsPercentage;
    private LocalDateTime createdAt;
}
