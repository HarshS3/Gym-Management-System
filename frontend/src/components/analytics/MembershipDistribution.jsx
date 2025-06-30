import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { config } from '../../config/config.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const MembershipDistribution = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
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
            const response = await axios.get(`${config.apiUrl}/analytics/membership-distribution`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                const data = response.data.data;
                setChartData(prev => ({
                    ...prev,
                    labels: data.map(item => item.planName),
                    datasets: [{
                        ...prev.datasets[0],
                        data: data.map(item => item.count)
                    }]
                }));
            }
        } catch (error) {
            console.error('Error fetching membership distribution:', error);
            setError('Failed to load membership distribution data');
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
            <h3 className="text-xl font-semibold mb-4 text-white">Membership Plan Distribution</h3>
            <div className="h-64">
                <Pie 
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

export default MembershipDistribution; 