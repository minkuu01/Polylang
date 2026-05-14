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
     * Retrieve the most recent 20 execution history records.
     */
    public List<ExecutionHistory> getRecentHistory() {
        return historyRepository.findTop20ByOrderByCreatedAtDesc();
    }

    /**
     * Get a specific history record by ID.
     */
    public ExecutionHistory getById(Long id) {
        return historyRepository.findById(id).orElse(null);
    }

    /**
     * Delete all history records.
     */
    public void clearHistory() {
        historyRepository.deleteAll();
    }
}
