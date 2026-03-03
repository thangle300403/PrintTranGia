import React from 'react';
import { ClockIcon } from '../components/icons/Icons';

interface PlaceholderPageProps {
    title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full">
                <ClockIcon />
            </div>
            <h1 className="mt-8 text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h1>
            <p className="mt-2 text-lg">Tính năng này đang được phát triển.</p>
            <p>Vui lòng quay lại sau!</p>
        </div>
    );
};

export default PlaceholderPage;