package com.optimizer.engine.repository;

import com.optimizer.engine.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByResourceId(String resourceId);
    Recommendation findTopByOrderByCreatedAtDesc();
}
