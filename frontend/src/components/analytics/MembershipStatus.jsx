import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { config } from '../../config/config.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const MembershipStatus = () => {
    const [chartData, setChartData] = useState({
        labels: ['Active', 'Inactive'],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 99, 132, 0.5)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        }]
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiUrl}/analytics/membership-status`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                const data = response.data.data;
                const activeCount = data.find(item => item.status === 'Active')?.count || 0;
                const inactiveCount = data.find(item => item.status === 'Inactive')?.count || 0;
                
                setChartData(prev => ({
                    ...prev,
                    datasets: [{
                        ...prev.datasets[0],
                        data: [activeCount, inactiveCount]
                    }]
                }));
            }
        } catch (error) {
            console.error('Error fetching membership status:', error);
            setError('Failed to load membership status data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 text-center h-64 flex items-center justify-center">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-4 text-white">Membership Status Overview</h3>
            <div className="h-64">
                <Doughnut 
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    color: 'white'
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default MembershipStatus; 