// ============================================================
//  ScholarAgent — Custom Algorand Hook
//  File: frontend/src/hooks/useAlgorand.js
// ============================================================

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook for ScholarAgent API interactions
 */
export function useAlgorand() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Submit a new application
    const submitApplication = useCallback(async (applicationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/applications/submit`, applicationData);
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger AI evaluation
    const evaluateApplication = useCallback(async (applicationId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/applications/${applicationId}/evaluate`);
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get application status
    const getApplication = useCallback(async (applicationId) => {
        try {
            const response = await axios.get(`${API_URL}/applications/${applicationId}`);
            return response.data;
        } catch (err) {
            return null;
        }
    }, []);

    // Get all applications (with optional status filter)
    const getApplications = useCallback(async (status = 'all') => {
        try {
            const response = await axios.get(`${API_URL}/applications?status=${status}`);
            return response.data;
        } catch (err) {
            return { total: 0, applications: [] };
        }
    }, []);

    // Get dashboard stats
    const getDashboardStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/applications/dashboard/stats`);
            return response.data;
        } catch (err) {
            return null;
        }
    }, []);

    // Get student history
    const getStudentHistory = useCallback(async (walletAddress) => {
        try {
            const response = await axios.get(`${API_URL}/applications/student/${walletAddress}`);
            return response.data;
        } catch (err) {
            return { applications: [], on_chain_history: [] };
        }
    }, []);

    return {
        loading,
        error,
        submitApplication,
        evaluateApplication,
        getApplication,
        getApplications,
        getDashboardStats,
        getStudentHistory,
    };
}
