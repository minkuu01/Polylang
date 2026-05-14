package com.polylang.service;

import com.polylang.model.ExecutionHistory;
import com.polylang.repository.HistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoryService {

    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    /**
     * Save a new execution history record.
     */
    public ExecutionHistory save(ExecutionHistory history) {
        return historyRepository.save(history);
    }

    /**
     * Retrieve the most recent 20 execution history records for a user.
     */
    public List<ExecutionHistory> getRecentHistory(String userId) {
        return historyRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get a specific history record by ID.
     */
    public ExecutionHistory getById(Long id) {
        return historyRepository.findById(id).orElse(null);
    }

    /**
     * Delete all history records for a specific user.
     */
    public void clearHistory(String userId) {
        historyRepository.deleteByUserId(userId);
    }

    /**
     * Delete a specific history record.
     */
    public void deleteById(Long id, String userId) {
        ExecutionHistory history = getById(id);
        if (history != null && history.getUserId().equals(userId)) {
            historyRepository.deleteById(id);
        }
    }
}
