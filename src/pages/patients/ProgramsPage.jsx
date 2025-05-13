import React, { useState } from 'react';
import {
  Search, ChevronRight, Check, Clock,
  ArrowRight, Settings, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ProgramsHeader from '../../components/patient/programs/ProgramsHeader';
import ProgramCategoryTabs from '../../components/patient/programs/ProgramCategoryTabs';
import NextUpSection from '../../components/patient/programs/NextUpSection';
import FeaturedProgramBanner from '../../components/patient/programs/FeaturedProgramBanner';
import BetterSexSection from '../../components/patient/programs/BetterSexSection';
import WeightManagementSection from '../../components/patient/programs/WeightManagementSection';
import './programs/ProgramsPage.css';

const ProgramsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('for-you');

  // Handler functions
  const handleProgramClick = (programId) => {
    navigate(`/programs/${programId}`);
    toast.info(`Opening program details for ${programId}`);
  };

  const handleWatchVideo = () => {
    toast.success('Opening video player');
  };

  const handleStartProgram = () => {
    toast.success('Starting premium program');
  };

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">

      {/* Header */}
      <ProgramsHeader />

      {/* Category Tabs */}
      <ProgramCategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Next Up For You Section */}
      <NextUpSection handleWatchVideo={handleWatchVideo} />

      {/* "Featured Program Banner" */}
      <FeaturedProgramBanner handleStartProgram={handleStartProgram} />

      {/* Better Sex Section */}
      <BetterSexSection handleProgramClick={handleProgramClick} handleWatchVideo={handleWatchVideo} />

      {/* Weight Management Section */}
      <WeightManagementSection handleProgramClick={handleProgramClick} handleWatchVideo={handleWatchVideo} />

      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default ProgramsPage;
