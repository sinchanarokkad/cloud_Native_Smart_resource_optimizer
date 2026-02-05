package com.optimizer.metrics.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "metrics")
public class Metric {
    @Id
    private String id;
    private String resourceId;
    private LocalDateTime timestamp;
    private Double cpu;
    private Double memory;
    private Double disk;
}
