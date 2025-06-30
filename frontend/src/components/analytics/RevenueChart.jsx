import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';
import { config } from '../../config/config.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RevenueChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Monthly Revenue',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.4
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
            const response = await axios.get(`${config.apiUrl}/analytics/monthly-revenue`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                const data = response.data.data;
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                setChartData(prev => ({
                    ...prev,
                    labels: data.map(item => `${months[item.month - 1]} ${item.year}`),
                    datasets: [{
                        ...prev.datasets[0],
                        data: data.map(item => item.totalRevenue)
                    }]
                }));
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            setError('Failed to load revenue data');
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
            <h3 className="text-xl font-semibold mb-4 text-white">Revenue Over Time</h3>
            <div className="h-64">
                <Line 
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: 'white'
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: 'white'
                                }
                            }
                        },
                        plugins: {
                            legend: {
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

export default RevenueChart; 