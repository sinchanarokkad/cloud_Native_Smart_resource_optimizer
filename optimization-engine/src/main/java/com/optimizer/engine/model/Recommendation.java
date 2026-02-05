package com.optimizer.engine.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "recommendations")
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String resourceId;
    private String recommendationType; // DOWNSCALE, UPSCALE, TERMINATE
    private String description;
    private LocalDateTime createdAt;
    private String status; // PENDING, APPLIED, IGNORED
    private Double confidence; // 0.0 - 1.0
}
