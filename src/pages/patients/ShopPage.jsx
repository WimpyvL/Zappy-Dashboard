import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/redesign/Button';
import ShopHeader from '../../components/patient/shop/ShopHeader'; // Import extracted ShopHeader
import ReferralBanner from '../../components/patient/shop/ReferralBanner'; // Import extracted ReferralBanner
import ShopNavigationTabs from '../../components/patient/shop/ShopNavigationTabs'; // Import extracted ShopNavigationTabs
import SmartProductRecommendation from '../../components/patient/shop/SmartProductRecommendation';
import FeaturedProduct from '../../components/patient/shop/FeaturedProduct';
import ReferralDiscountsSection from '../../components/patient/shop/ReferralDiscountsSection';
import CategoriesSection from '../../components/patient/shop/CategoriesSection';
import CompleteTreatmentsSection from '../../components/patient/shop/CompleteTreatmentsSection';
import './shop/ShopPage.css';

const ShopPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('featured');
  const [cartCount, setCartCount] = useState(3);

  // Placeholder data to satisfy linter - replace with actual data fetching
  const featuredProducts = [];
  const categories = [];
  const completeTreatments = [];

  // Handler functions
  const handleAddProduct = (product) => {
    setCartCount(cartCount + 1);
    toast.success(`${product} added to cart`);
  };

  const handleViewDetails = (productId) => {
    navigate(`/shop/${productId}`);
    toast.info(`Viewing details for ${productId}`);
  };

  const handleReferral = () => {
    toast.info('Referral link copied to clipboard!');
  };

  const handleViewBundle = () => {
    toast.info('Viewing bundle details');
  };

  const handleSkip = () => {
    toast.info('Recommendation skipped');
  };

  const handleViewAllCategories = () => {
    toast.info('Viewing all categories');
  };

  const handleInviteMore = () => {
    toast.info('Invite more friends dialog opened');
  };

  return (
    <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-gray-50 min-h-screen pb-20">

      {/* Header */}
      <ShopHeader cartCount={cartCount} />

      {/* Referral Banner */}
      <ReferralBanner handleReferral={handleReferral} />

      {/* Navigation Tabs */}
      <ShopNavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Smart Product Recommendation */}
      <SmartProductRecommendation handleViewBundle={handleViewBundle} handleSkip={handleSkip} />

      {/* Featured Product */}
      <FeaturedProduct featuredProducts={featuredProducts} handleViewDetails={handleViewDetails} handleAddProduct={handleAddProduct} />

      {/* Referral Discounts Section */}
      <ReferralDiscountsSection handleInviteMore={handleInviteMore} />

      {/* Categories Section */}
      <CategoriesSection categories={categories} handleViewAllCategories={handleViewAllCategories} />

      {/* Complete Your Treatments Section */}
      <CompleteTreatmentsSection completeTreatments={completeTreatments} handleAddProduct={handleAddProduct} handleViewBundle={handleViewBundle} />

      {/* Bottom Navigation is now handled by MainLayout.jsx */}
    </div>
  );
};

export default ShopPage;
