import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './home/PatientHomePage.css'; // Import the new CSS file
import { supabase } from '../../lib/supabase';
import PatientNotifications from '../../components/patient/notifications/PatientNotifications';
import {
  Home, Heart, BookOpen, ShoppingBag, Plus, MessageSquare, Share2, HelpCircle,
  Bell, Package, Calendar, Pill, UserPlus, Building, FileText, Settings, LogOut,
  ClipboardList, Tag, Percent, Hash, History, Map, LayoutDashboard, ShoppingCart,
  LayoutGrid, FolderClock, Headphones, UserCog, Layers, Camera, Clock, ChevronRight,
  ArrowRight, TrendingDown, TrendingUp
} from 'lucide-react'; // Import necessary icons

// Import the data hook and auth context
import usePatientServicesData from '../../hooks/usePatientServicesData';
import { useAuth } from '../../contexts/auth/AuthContext';

// Get patientId from auth context
const usePatientId = () => {
  const { currentUser } = useAuth();
  return currentUser?.id || null;
};


const PatientHomePage = () => {
  const navigate = useNavigate();
  const patientId = usePatientId(); // Get patientId
  const { processedServices, isLoading, error } = usePatientServicesData(patientId);

  const [activeProgram, setActiveProgram] = useState(null); // State for active program tab, initialized to null
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // User action status - this would come from an API in a real implementation
  const [userActionStatus, setUserActionStatus] = useState({
    intakeForm: {
      status: "not_started", // or "in_progress", "completed", "requires_update"
      lastUpdated: null,
      categoryId: null
    },
    idVerification: {
      status: "not_started", // or "submitted", "verified", "rejected"
      lastUpdated: null,
      rejectionReason: null
    },
    prescription: {
      status: "pending", // or "approved", "denied", "requires_info"
      lastUpdated: null,
      providerId: null
    },
    invoice: {
      status: "pending", // or "paid", "overdue"
      lastUpdated: null,
      amount: 89.00,
      dueDate: "2025-05-25"
    }
  });

  // Derive program tabs and content from fetched services
  const programs = useMemo(() => {
    if (!processedServices || processedServices.length === 0) return [];
    // Assuming each service corresponds to a program tab
    return processedServices.map(service => ({
      id: service.id,
      name: service.name, // Assuming service object has a name
      serviceType: service.service_type, // Assuming service object has service_type
      // Add other relevant properties from service object
    }));
  }, [processedServices]);

  // Set initial active program once services are loaded
  useEffect(() => {
    if (programs.length > 0 && activeProgram === null) {
      setActiveProgram(programs[0].serviceType); // Set first service type as active
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs]);


  // Placeholder program configuration - ideally derived from service data
  const programConfig = useMemo(() => {
     if (!processedServices) return {};
     const config = {};
     processedServices.forEach(service => {
       // Map service_type to a class and colors - this mapping might need to be defined elsewhere
       // or fetched as part of service data
       const defaultConfig = {
         class: 'program-default',
         priorityText: `Your ${service.name} task is due`,
         colors: {
           primary: '#0f766e', // Teal
           lightBg: '#f0fdfa',
           darkText: '#134e4a',
           light: '#f0fdfa',
           gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
         }
       };

       // Example mapping based on service type
       if (service.service_type === 'weight-management') {
         config[service.service_type] = {
           class: 'program-weight',
           priorityText: 'Your Semaglutide injection is due today', // This should be dynamic based on tasks
           colors: {
             primary: '#0891b2',
             lightBg: '#ecfeff',
             darkText: '#0e7490',
             light: '#ecfeff',
             gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)'
           }
         };
       } else if (service.service_type === 'hair-loss') {
          config[service.service_type] = {
            class: 'program-hair',
            priorityText: 'Apply Minoxidil to affected areas', // This should be dynamic based on tasks
            colors: {
              primary: '#7c3aed',
              lightBg: '#f3f4f6',
              darkText: '#5b21b6',
              light: '#f3f4f6',
              gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
            }
          };
       }
       // Add more mappings for other service types

       if (!config[service.service_type]) {
           config[service.service_type] = defaultConfig;
       }
     });
     return config;
  }, [processedServices]);


  // Placeholder instruction prompts - ideally fetched as resources
  const instructionPrompts = useMemo(() => ({
    semaglutide: {
      title: 'Semaglutide Injection Instructions',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h4 class="font-semibold text-blue-900 mb-2">Before Injection:</h4>
            <ul class="text-blue-800 space-y-1">
              <li>• Wash your hands thoroughly</li>
              <li>• Check expiration date and solution clarity</li>
              <li>• Let pen reach room temperature (15-30 mins)</li>
            </ul>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h4 class="font-semibold text-green-900 mb-2">Injection Site:</h4>
            <p class="text-green-800">Rotate between: thigh, abdomen, or upper arm. Use different site each week.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded-lg">
            <h4 class="font-semibold text-amber-900 mb-2">Timing:</h4>
            <p class="text-amber-800">Same day each week, can be taken with or without food.</p>
          </div>
        </div>
      `
    },
    minoxidil: {
      title: 'Minoxidil Application Instructions',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h4 class="font-semibold text-blue-900 mb-2">Before Application:</h4>
            <ul class="text-blue-800 space-y-1">
              <li>• Ensure scalp is clean and dry</li>
              <li>• Part hair to expose scalp</li>
              <li>• Wash hands before and after use</li>
            </ul>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h4 class="font-semibold text-green-900 mb-2">Application:</h4>
            <ul class="text-green-800 space-y-1">
              <li>• Apply 1ml (6 pumps) to affected areas</li>
              <li>• Spread evenly with fingertips</li>
              <li>• Let dry for 2-4 hours before bed</li>
            </ul>
          </div>
          <div class="bg-amber-50 p-3 rounded-lg">
            <h4 class="font-semibold text-amber-900 mb-2">Important:</h4>
            <p class="text-amber-800">Use twice daily. Results typically seen after 3-4 months of consistent use.</p>
          </div>
        </div>
      `
    },
    'injection-rotation': {
      title: 'Injection Site Rotation Guide',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h4 class="font-semibold text-blue-900 mb-2">Recommended Sites:</h4>
            <ul class="text-blue-800 space-y-1">
              <li>• <strong>Thigh:</strong> Front or outer side, 4 inches above knee</li>
              <li>• <strong>Abdomen:</strong> 2 inches from belly button, avoid waistband</li>
              <li>• <strong>Upper arm:</strong> Back/outer area, have someone help</li>
            </ul>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h4 class="font-semibold text-green-900 mb-2">Rotation Pattern:</h4>
            <p class="text-green-800">Use a different site each week. Mark on calendar or take photos to track.</p>
          </div>
        </div>
      `
    },
    'missed-dose': {
      title: 'Missed Dose Guidelines',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h4 class="font-semibold text-blue-900 mb-2">Within 5 Days:</h4>
            <p class="text-blue-800">Take the missed dose as soon as you remember, then continue with your regular schedule.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded-lg">
            <h4 class="font-semibold text-amber-900 mb-2">More Than 5 Days:</h4>
            <p class="text-amber-800">Skip the missed dose and take your next dose on the regularly scheduled day.</p>
          </div>
          <div class="bg-red-50 p-3 rounded-lg">
            <h4 class="font-semibold text-red-900 mb-2">Important:</h4>
            <p class="text-red-800">Contact your healthcare provider if you miss doses frequently.</p>
          </div>
        </div>
      `
    }
  }), []);


  const showToast = (message, type = 'info') => {
    toast[type](message);
  };

  const handleShowInstructionsModal = useCallback((type) => {
    const instruction = instructionPrompts[type];
    if (!instruction) return;
    setCurrentInstruction(instruction);
    setShowInstructionsModal(true);
  }, [instructionPrompts]);

  const handleCloseInstructionsModal = useCallback(() => {
    setShowInstructionsModal(false);
    setCurrentInstruction(null);
  }, []);


  const handleMarkTaskComplete = useCallback((taskId) => {
    console.log(`Marking task ${taskId} complete`);
    showToast('Great job! Task completed.', 'success');
    // Implement actual task completion API call
  }, [showToast]);

  const handleCTAClick = useCallback((programServiceType, action) => {
    console.log(`Handling CTA click for ${programServiceType}: ${action}`);
    showToast(`Opening ${action}...`, 'info');
    // Implement actual navigation or action logic based on programServiceType and action
    // e.g., navigate('/log-weight')
  }, [showToast]);

  const shareReferral = useCallback((method) => {
    const referralCode = 'MICHEL40'; // This should ideally come from user data
    const shareText = `Get $40 off your first Zappy order and I get $40 too! Use my code: ${referralCode}`;
    const shareUrl = `https://zappy.health/ref/${referralCode}`;

    if (method === 'copy') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Referral link copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Referral code: MICHEL40', 'info');
      });
    } else if (method === 'share' && navigator.share) {
      navigator.share({
        title: 'Get $40 off Zappy',
        text: shareText,
        url: shareUrl
      }).catch((err) => {
        console.log('Share cancelled');
      });
    } else {
      const shareData = `${shareText} ${shareUrl}`;
      navigator.clipboard.writeText(shareData).then(() => {
        showToast('Referral link copied!', 'success');
      });
    }
  }, [showToast]);

  const copyReferralCode = useCallback(() => {
    const referralCode = 'MICHEL40'; // This should ideally come from user data
    navigator.clipboard.writeText(referralCode).then(() => {
      showToast('Referral code copied!', 'success');
    }).catch(() => {
      showToast('Referral code: MICHEL40', 'info');
    });
  }, [showToast]);

  const handleResourceCardClick = useCallback((resourceId) => {
    console.log(`Opening resource ${resourceId}`);
    showToast(`Opening resource...`, 'info');
    // Implement actual resource navigation
  }, [showToast]);

  const handleTrendingCardClick = useCallback((productId) => {
    console.log(`Viewing product ${productId}`);
    showToast(`Viewing product details...`, 'info');
    // Implement actual product navigation
  }, [showToast]);


  // Effect to apply theme colors based on active program
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    const headerEl = document.querySelector('.header-gradient');
    const config = programConfig[activeProgram] || programConfig['weight-management']; // Fallback to weight-management

    const applyThemeToElement = (element, colors) => {
      if (element && colors) {
        Object.keys(colors).forEach(key => {
          element.style.setProperty(`--${key}`, colors[key]);
        });
      }
    };

    if (config && config.colors) {
      applyThemeToElement(mainContent, config.colors);
      applyThemeToElement(headerEl, config.colors);
    }

    // Update trending card themes - this part still relies on class names
    document.querySelectorAll('.trending-card').forEach(tc => {
      let cardProgramKey = 'weight-management'; // Default
      if (tc.classList.contains('program-hair')) cardProgramKey = 'hair-loss';
      else if (tc.classList.contains('program-aging')) cardProgramKey = 'anti-aging'; // Assuming anti-aging service type

      const cardConfig = programConfig[cardProgramKey] || programConfig['weight-management'];
      if (cardConfig && cardConfig.colors) {
        const iconBg = tc.querySelector('.trending-card-icon-bg');
        const icon = tc.querySelector('.trending-card-icon');
        if (iconBg) applyThemeToElement(iconBg, cardConfig.colors);
        if (icon) applyThemeToElement(icon, cardConfig.colors);
      }
    });


  }, [activeProgram, programConfig]); // Re-run when activeProgram or programConfig changes


  // Update status bar for program - needs to use fetched data
  const updateStatusBarForProgram = useCallback((programServiceType) => {
    const statusBar = document.getElementById('statusBar');
    const nextRefillText = document.getElementById('nextRefillText');
    const expandedRefills = document.getElementById('expandedRefills');

    // This logic needs to be updated to use actual refill and check-in data
    // from the fetched processedServices
    const serviceData = processedServices?.find(service => service.service_type === programServiceType);

    if (!serviceData) {
        if (nextRefillText) nextRefillText.textContent = 'Loading...';
        if (expandedRefills) expandedRefills.classList.add('hidden');
        if (statusBar) {
            statusBar.style.cursor = 'default';
            statusBar.onclick = null;
        }
        return;
    }

    // Placeholder logic using serviceData (replace with actual data access)
    const nextRefill = serviceData.nextRefillDate || 'N/A'; // Assuming serviceData has nextRefillDate
    const hasMultipleRefills = serviceData.upcomingRefills?.length > 1; // Assuming serviceData has upcomingRefills array
    const checkinDate = serviceData.nextCheckinDate || 'N/A'; // Assuming serviceData has nextCheckinDate


    if (nextRefillText) {
      nextRefillText.textContent = `Next refill ${nextRefill}`;
    }

    if (expandedRefills) {
      if (hasMultipleRefills) {
        nextRefillText.textContent = `${serviceData.upcomingRefills.length} refills due soon`;
        expandedRefills.classList.remove('hidden');
        // Populate expandedRefills content here based on serviceData.upcomingRefills
      } else {
        expandedRefills.classList.add('hidden');
      }
    }

    if (statusBar) {
      if (hasMultipleRefills) {
        statusBar.style.cursor = 'pointer';
        statusBar.onclick = () => {
          if (expandedRefills) expandedRefills.classList.toggle('hidden');
        };
      } else {
        statusBar.style.cursor = 'default';
        statusBar.onclick = null;
      }
    }

    // Update check-in date display
    const checkinTextEl = statusBar?.querySelector('div:last-child span:first-child');
    if(checkinTextEl) {
        checkinTextEl.textContent = `Check-in ${checkinDate}`;
    }


  }, [activeProgram, processedServices]); // Depend on activeProgram and processedServices


  // Update CTA buttons based on check-in status - needs to use fetched data
  const updateCTABasedOnCheckin = useCallback((programServiceType, container, defaultButtonId, defaultText) => {
    const serviceData = processedServices?.find(service => service.service_type === programServiceType);
    if (!serviceData || !container) return;

    // This logic needs to be updated to use actual check-in status from serviceData
    const today = new Date();
    const checkinStatus = serviceData.checkinStatus; // Assuming serviceData has checkinStatus

    const createButton = (className, text, id) => `<button class="${className} w-full" id="${id}">${text}</button>`;

    // Placeholder logic using checkinStatus (replace with actual data access)
    if (checkinStatus === 'overdue') {
      container.innerHTML = createButton('cta-checkin-overdue', '<span class="flex items-center justify-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Complete Check-in (Overdue)</span>', `checkin-${programServiceType}`);
    } else if (checkinStatus === 'due-today') {
      container.innerHTML = createButton('cta-checkin-due', '<span class="flex items-center justify-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Start Check-in</span>', `checkin-${programServiceType}`);
    } else if (checkinStatus === 'due-tomorrow') {
      container.innerHTML = `
        <div class="space-y-2">
          ${createButton('cta-checkin-due', '<span class="flex items-center justify-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Check-in Available</span>', `checkin-${programServiceType}`)}
          ${createButton('cta-secondary', defaultText, defaultButtonId)}
        </div>
      `;
    } else if (checkinStatus === 'due-in-two-days') {
      container.innerHTML = `
        <div class="flex gap-3">
          ${createButton('cta-secondary flex-1', defaultText, defaultButtonId)}
          ${createButton('cta-checkin-due flex-1', '<span class="flex items-center justify-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Check-in</span>', `checkin-${programServiceType}`)}
        </div>
      `;
    } else {
       // Default state - ensure the default button is there if no special condition met
       if (!document.getElementById(defaultButtonId)) {
         container.innerHTML = createButton('cta-primary w-full', defaultText, defaultButtonId);
       }
    }

    // Add event listeners for check-in buttons
    const checkinButton = document.getElementById(`checkin-${programServiceType}`);
    if (checkinButton) {
      checkinButton.addEventListener('click', () => {
        showToast(`Starting ${programServiceType} check-in...`, 'info');
        // In real app, navigate to check-in flow
      });
    }
  }, [showToast, processedServices]);


  // Update CTAs based on check-in status for all programs - needs to use fetched data
  const updateAllCTAs = useCallback(() => {
    const containers = {
      'weight-management': { // Use service type as key
        container: document.getElementById('weightCTAContainer'),
        defaultButtonId: 'logWeightButtonWeight',
        defaultText: 'Log Today\'s Weight'
      },
      'hair-loss': { // Use service type as key
        container: document.getElementById('hairCTAContainer'),
        defaultButtonId: 'viewProgressPhotosHair',
        defaultText: 'View Progress Photos'
      },
      'anti-aging': { // Use service type as key
        container: document.getElementById('agingCTAContainer'),
        defaultButtonId: 'logSkinHealthAging',
        defaultText: 'Log Skin Health'
      }
      // Add containers for other service types
    };

    Object.keys(containers).forEach(programServiceType => {
      const { container, defaultButtonId, defaultText } = containers[programServiceType];
      if (container) { // Check if container exists
        updateCTABasedOnCheckin(programServiceType, container, defaultButtonId, defaultText);
      }
    });
  }, [updateCTABasedOnCheckin]);


  // Effect to fetch unread notifications count
  useEffect(() => {
    if (patientId) {
      const fetchUnreadNotificationsCount = async () => {
        try {
          const { data, error } = await supabase
            .from('patient_notifications')
            .select('id', { count: 'exact' })
            .eq('patient_id', patientId)
            .eq('is_read', false);
            
          if (error) {
            console.error('Error fetching unread notifications count:', error);
            return;
          }
          
          setUnreadNotificationsCount(data?.length || 0);
        } catch (err) {
          console.error('Error in fetchUnreadNotificationsCount:', err);
        }
      };
      
      fetchUnreadNotificationsCount();
      
      // Set up a polling interval to check for new notifications
      const intervalId = setInterval(fetchUnreadNotificationsCount, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [patientId]);

  // Initial data load and UI setup
  useEffect(() => {
    // Update dynamic greeting
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const greetingElement = document.querySelector('header h1');
      const name = 'Michel'; // This should ideally come from user data
      let greeting;

      if (hour < 5) greeting = 'Good night';
      else if (hour < 12) greeting = 'Good morning';
      else if (hour < 18) greeting = 'Good afternoon';
      else greeting = 'Good evening';

      if (greetingElement) {
        greetingElement.innerHTML = `${greeting}, <span class="block">${name}</span>`;
      }
    };
    updateGreeting();

    // Initial theme and CTA setup is now handled by effects that depend on activeProgram and processedServices
    // Call updateAllCTAs initially
    updateAllCTAs();


  }, [updateAllCTAs]); // Depend on updateAllCTAs


  // Effect to update status bar and CTAs when processedServices changes
  useEffect(() => {
      if (activeProgram) {
          updateStatusBarForProgram(activeProgram);
          updateAllCTAs();
      }
  }, [processedServices, activeProgram, updateStatusBarForProgram, updateAllCTAs]);


  // Instruction modals (using useCallback for stability)
  const handleViewInstructionsClick = useCallback((type) => {
    const instruction = instructionPrompts[type];
    if (!instruction) return;
    setCurrentInstruction(instruction);
    setShowInstructionsModal(true);
  }, [instructionPrompts]);


  // Mark task complete functionality - needs to use fetched data
  const handleMarkTaskCompleteClick = useCallback((e) => {
    const taskButton = e.currentTarget;
    const taskId = taskButton.id.replace('markTaskComplete', ''); // Assuming task ID is in button ID

    // Add success animation and update button state
    taskButton.classList.add('success-animation');
    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      taskButton.textContent = 'Done ✓';
      taskButton.disabled = true;
      taskButton.classList.add('opacity-60', 'cursor-not-allowed');

      const statusDot = taskButton.closest('.program-card')?.querySelector('.status-dot');
      if (statusDot) {
        statusDot.classList.remove('status-urgent', 'status-normal');
        statusDot.classList.add('status-complete');
        statusDot.style.animation = 'none';
      }

      showToast('Great job! Task completed.', 'success');
      // Implement actual task completion API call using taskId
      handleMarkTaskComplete(taskId);

    }, 300);
  }, [showToast, handleMarkTaskComplete]);


  // Generic CTA buttons - needs to use fetched data
  const handleGenericCTAClick = useCallback((e) => {
    const journeyButton = e.currentTarget;
    const actionId = journeyButton.id; // Assuming action ID is in button ID

    showToast(`Opening ${journeyButton.textContent.toLowerCase()}...`, 'info');

    const originalText = journeyButton.textContent;
    journeyButton.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-3 text-white inline-block" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    `;
    journeyButton.disabled = true;

    setTimeout(() => {
      journeyButton.textContent = originalText;
      journeyButton.disabled = false;
      // Implement actual action logic based on actionId
      // e.g., navigate('/log-weight') if actionId is 'logWeightButtonWeight'
      const programServiceType = Object.keys(programConfig).find(key =>
          programConfig[key].ctaButtonIds?.includes(actionId) // Assuming programConfig has ctaButtonIds array
      );
      if(programServiceType) {
          handleCTAClick(programServiceType, originalText); // Pass program service type and button text
      }

    }, 1500);
  }, [showToast, programConfig, handleCTAClick]);


  // Referral program functionality - uses hardcoded data, should be fetched
  const handleShareReferralClick = useCallback((e) => {
    const method = e.currentTarget.dataset.shareMethod;
    shareReferral(method);
  }, [shareReferral]);

  const handleCopyReferralCodeClick = useCallback(() => {
    copyReferralCode();
  }, [copyReferralCode]);


  // Attach event listeners using React's useEffect
  useEffect(() => {
    // Attach listeners for instruction links
    document.querySelectorAll('.view-instructions-link, .quick-help-button').forEach(button => {
      const instructionType = button.dataset.instructionType;
      if (instructionType) {
        const handler = () => handleShowInstructionsModal(instructionType);
        button.addEventListener('click', handler);
        // Return a cleanup function
        return () => button.removeEventListener('click', handler);
      }
    });

    // Attach listeners for mark task complete buttons
    document.querySelectorAll('[id^="markTaskComplete"]').forEach(button => {
      const handler = () => handleMarkTaskCompleteClick(button.id.replace('markTaskComplete', ''));
      button.addEventListener('click', handler);
      // Return a cleanup function
      return () => button.removeEventListener('click', handler);
    });

    // Attach listeners for generic CTA buttons
    document.querySelectorAll('[id^="logWeightButton"], [id^="viewProgressPhotos"], [id^="logSkinHealth"], [id^="viewProgressPeptides"], [id^="checkProgressED"], [id^="logSleepButton"]').forEach(button => {
      const handler = () => handleGenericCTAClick(button.id);
      button.addEventListener('click', handler);
      // Return a cleanup function
      return () => button.removeEventListener('click', handler);
    });

    // Attach listeners for referral share buttons
    document.querySelectorAll('[data-share-method]').forEach(button => {
      const method = button.dataset.shareMethod;
      const handler = () => shareReferral(method);
      button.addEventListener('click', handler);
      // Return a cleanup function
      return () => button.removeEventListener('click', handler);
    });

    // Attach listener for copy referral code button
    const copyCodeButton = document.querySelector('[data-copy-referral]'); // Assuming a data attribute for this
    if (copyCodeButton) {
        const handler = () => copyReferralCode();
        copyCodeButton.addEventListener('click', handler);
        // Return a cleanup function
        return () => copyCodeButton.removeEventListener('click', handler);
    }


    // Attach listeners for resource cards
    document.querySelectorAll('.resource-card').forEach(card => {
      const resourceId = card.dataset.resourceId;
      if (resourceId) {
        const handler = () => handleResourceCardClick(resourceId);
        card.addEventListener('click', handler);
        // Return a cleanup function
        return () => card.removeEventListener('click', handler);
      }
    });

    // Attach listeners for trending cards
    document.querySelectorAll('.trending-card').forEach(card => {
      const productId = card.dataset.productId;
      if (productId) {
        const handler = () => handleTrendingCardClick(productId);
        card.addEventListener('click', handler);
        // Return a cleanup function
        return () => card.removeEventListener('click', handler);
      }
    });


  }, [handleShowInstructionsModal, handleMarkTaskCompleteClick, handleGenericCTAClick, shareReferral, copyReferralCode, handleResourceCardClick, handleTrendingCardClick]); // Add all handler dependencies


  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data: {error.message}</div>;
  }

  // Find the active service based on activeProgram
  const activeService = processedServices?.find(service => service.service_type === activeProgram);
  const currentProgramConfig =
    programConfig[activeProgram] ||
    programConfig['weight-management'] ||
    {
      class: 'program-default',
      priorityText: '',
      colors: {
        primary: '#0f766e',
        lightBg: '#f0fdfa',
        darkText: '#134e4a',
        light: '#f0fdfa',
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
      }
    };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header with improved gradient - more compact */}
      <header className="header-gradient pt-6 pb-4 px-6">
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                id="notificationsButton" 
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm" 
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-400 rounded-full"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                  <PatientNotifications patientId={patientId} />
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                className="w-9 h-9 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=80&h=80&fit=crop&q=80" alt="Michel's avatar" className="w-full h-full object-cover" />
              </button>
              
              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Michel Choueiri</p>
                    <p className="text-xs text-gray-500 truncate">michel@example.com</p>
                  </div>
                  
                  <ul className="py-1">
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/profile');
                        }}
                      >
                        <UserCog className="w-4 h-4 mr-3 text-gray-500" />
                        Profile Settings
                      </button>
                    </li>
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/billing');
                        }}
                      >
                        <FileText className="w-4 h-4 mr-3 text-gray-500" />
                        Billing & Invoices
                      </button>
                    </li>
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/subscriptions');
                        }}
                      >
                        <Layers className="w-4 h-4 mr-3 text-gray-500" />
                        Subscriptions
                      </button>
                    </li>
                    <li>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/orders');
                        }}
                      >
                        <Package className="w-4 h-4 mr-3 text-gray-500" />
                        Orders & Shipments
                      </button>
                    </li>
                  </ul>
                  
                  <div className="py-1 border-t border-gray-100">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Handle logout
                        console.log('Logging out...');
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Refills and check-ins status bar - needs to use fetched data */}
      <div className="px-6 py-2.5 bg-white/90 backdrop-blur-sm" id="statusBar">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center text-gray-500">
            <svg className="w-3 h-3 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span id="nextRefillText">{activeService?.nextRefillDate ? `Next refill ${activeService.nextRefillDate}` : 'Refill info N/A'}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>Check-in {activeService?.nextCheckinDate || 'N/A'}</span>
            {activeService?.checkinStatus === 'due-today' && (
              <svg className="w-3 h-3 ml-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
             {activeService?.checkinStatus === 'overdue' && (
              <svg className="w-3 h-3 ml-1.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
          </div>
        </div>

        {/* Expandable view for multiple refills - needs to use fetched data */}
        {activeService?.upcomingRefills?.length > 1 && (
          <div className="mt-2 pt-2 border-t border-gray-100" id="expandedRefills">
            <div className="space-y-1 text-xs text-gray-400">
              {activeService.upcomingRefills.map((refill, index) => (
                <div key={index} className="flex justify-between">
                  <span>• {refill.medicationName}</span> {/* Assuming refill object has medicationName */}
                  <span>{refill.date}</span> {/* Assuming refill object has date */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <main className="px-6 pt-4 pb-24" id="main-content">
        {/* Action Items - based on user action status */}
        {(() => {
          // Determine which action item to show based on priority
          if (userActionStatus.intakeForm.status === 'not_started' || userActionStatus.intakeForm.status === 'in_progress') {
            return (
              <button 
                id="completeIntakeFormButton" 
                className="notification-banner w-full text-left transition-all duration-300 cursor-pointer" 
                tabIndex="0" 
                role="button" 
                aria-label="Complete intake form"
                onClick={() => navigate('/intake-form', { 
                  state: { 
                    productCategory: activeProgram,
                    prescriptionItems: activeService?.medications || []
                  } 
                })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium" id="priority-text">Complete your medical intake form</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-full font-medium">Required</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          } else if (userActionStatus.idVerification.status === 'not_started' || userActionStatus.idVerification.status === 'rejected') {
            return (
              <button 
                id="verifyIdButton" 
                className="notification-banner w-full text-left transition-all duration-300 cursor-pointer" 
                tabIndex="0" 
                role="button" 
                aria-label="Verify your ID"
                onClick={() => navigate('/intake-form', { 
                  state: { 
                    step: 'id_verification',
                    productCategory: activeProgram,
                    prescriptionItems: activeService?.medications || []
                  } 
                })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium" id="priority-text">Verify your ID for prescription approval</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-full font-medium">Required</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          } else if (userActionStatus.invoice.status === 'pending' || userActionStatus.invoice.status === 'overdue') {
            return (
              <button 
                id="payInvoiceButton" 
                className="notification-banner w-full text-left transition-all duration-300 cursor-pointer" 
                tabIndex="0" 
                role="button" 
                aria-label="Pay your invoice"
                onClick={() => navigate('/billing/invoices')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium" id="priority-text">
                      {userActionStatus.invoice.status === 'overdue' 
                        ? `Your invoice of $${userActionStatus.invoice.amount} is overdue` 
                        : `Pay your invoice of $${userActionStatus.invoice.amount}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${userActionStatus.invoice.status === 'overdue' ? 'bg-red-600' : 'bg-amber-600'} text-white px-3 py-1.5 rounded-full font-medium`}>
                      {userActionStatus.invoice.status === 'overdue' ? 'Overdue' : 'Due Soon'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          } else if (activeService?.priorityTask) {
            return (
              <button 
                id="priorityActionButton" 
                className="notification-banner w-full text-left transition-all duration-300 cursor-pointer" 
                tabIndex="0" 
                role="button" 
                aria-label="Complete today's priority task"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium" id="priority-text">{activeService.priorityTask.text}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-full font-medium">Complete</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          }
          
          return null;
        })()}


        {/* Program tabs with improved styling - dynamically rendered */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Plans</h2>
          <div className="program-tabs" id="program-tabs" role="tablist">
            {programs.map(program => (
              <button
                key={program.id}
                className={`program-tab ${activeProgram === program.serviceType ? 'active' : ''} ${programConfig[program.serviceType]?.class || 'program-default'}`}
                data-program={program.serviceType}
                role="tab"
                aria-selected={activeProgram === program.serviceType}
                onClick={() => setActiveProgram(program.serviceType)}
              >
                {program.name}
              </button>
            ))}
          </div>
        </div>

        {/* Program content - dynamically rendered based on activeProgram */}
        {processedServices?.map(service => (
          <div
            key={service.id}
            id={`${service.service_type}-content`}
            className={`program-content ${activeProgram !== service.service_type ? 'hidden' : ''}`}
            role="tabpanel"
            aria-labelledby={`${service.service_type}-tab`}
          >
            {/* Hero Card - needs to use fetched data */}
            <div className="hero-card mb-6">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="hero-title mb-2">{service.progressTitle || 'Progress'}</h2> {/* Assuming service has progressTitle */}
                    <p className="subtitle">{service.progressSubtitle || 'Updates'}</p> {/* Assuming service has progressSubtitle */}
                  </div>
                  <div className="progress-text">{service.progressStatus || 'N/A'}</div> {/* Assuming service has progressStatus */}
                </div>
                {/* Add other progress details based on service data */}
                {/* Example for weight: */}
                {service.service_type === 'weight-management' && (
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <div className="flex items-center">
                         <p className="text-xl font-bold text-gray-900">{service.currentWeight || 'N/A'} lbs</p> {/* Assuming service has currentWeight */}
                         {service.weightChangeIcon === 'up' && <TrendingUp className="w-4 h-4 ml-2 text-red-600" />} {/* Assuming service has weightChangeIcon */}
                         {service.weightChangeIcon === 'down' && <TrendingDown className="w-4 h-4 ml-2 text-green-600" />}
                       </div>
                       <p className="text-sm text-gray-500">Current weight</p>
                     </div>
                     <div className="text-right">
                       <p className={`text-lg font-semibold ${service.weightChangeColor || 'text-gray-900'}`}>{service.weeklyWeightChange || 'N/A'} lbs</p> {/* Assuming service has weeklyWeightChange and weightChangeColor */}
                       <p className="text-sm text-gray-500">This week</p>
                     </div>
                   </div>
                )}
                 {/* Add similar blocks for other service types */}

                <div className="mb-4">
                  <div className="flex justify-end text-xs text-gray-500 mb-1">
                    <span>{service.progressToGoalText || 'Progress to goal'}</span> {/* Assuming service has progressToGoalText */}
                  </div>
                  <div className="bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={service.progressPercentage || 0} aria-valuemin="0" aria-valuemax="100" aria-label={`${service.progressPercentage || 0}% progress`}> {/* Assuming service has progressPercentage */}
                    <div className="progress-indicator" style={{ width: `${service.progressPercentage || 0}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-center items-center text-xs text-gray-400 mb-3">
                  <span>Check-in: {service.nextCheckinDate || 'N/A'}</span> {/* Assuming service has nextCheckinDate */}
                </div>

                {/* Contextual CTA based on check-in status - rendered by effect */}
                <div id={`${service.service_type}CTAContainer`}>
                   {/* CTA button will be rendered here by updateCTABasedOnCheckin */}
                </div>
              </div>
            </div>

            {/* Current medication card with integrated refill info - needs to use fetched data */}
            {service.medications?.map(medication => ( // Assuming service has a medications array
              <div key={medication.id} className="program-card mb-6">
                <div className="flex items-start">
                  <span className={`status-dot ${medication.status === 'urgent' ? 'status-urgent' : medication.status === 'complete' ? 'status-complete' : 'status-normal'} mt-1`} role="img" aria-label={`${medication.status} task`}></span> {/* Assuming medication has status */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{medication.name}</p> {/* Assuming medication has name */}
                    <p className="text-sm text-gray-600">{medication.instructionsSummary}</p> {/* Assuming medication has instructionsSummary */}

                    {/* Integrated refill status */}
                    <div className="mt-2 text-xs text-gray-500">
                      <span>Refill: {medication.nextRefillDate || 'N/A'}</span> {/* Assuming medication has nextRefillDate */}
                      {medication.refillStatus && ( // Assuming medication has refillStatus
                        <>
                          <span className="mx-2">•</span>
                          <span className={`font-medium ${medication.refillStatusColor || 'text-gray-600'}`}>{medication.refillStatus}</span> {/* Assuming medication has refillStatusColor */}
                        </>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 mt-2">
                      {medication.instructionType && ( // Assuming medication has instructionType for modal
                        <button className="text-xs text-blue-600 font-medium underline view-instructions-link inline-flex items-center" data-instruction-type={medication.instructionType}>
                          View detailed instructions
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                      <button 
                        className="text-xs text-blue-600 font-medium underline inline-flex items-center"
                        onClick={() => navigate(`/treatment-plan/tp-123456`)} // Using a mock plan ID for now
                      >
                        View full treatment plan
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
                {medication.taskId && ( // Assuming medication has a taskId if it's a task
                  <button className="cta-secondary w-full mt-4" id={`markTaskComplete${medication.taskId}`}>Mark Done</button>
                )}
              </div>
            ))}


            {/* Learning & Resources title outside the card */}
            {service.resources?.length > 0 && ( // Assuming service has a resources array
              <h3 className="text-lg font-bold text-gray-900 mb-4">Learning & Resources</h3>
            )}


            <div className="program-card mb-6">
              {/* Recommended for You - needs to use fetched data */}
              {service.resources?.filter(r => r.category === 'recommended').length > 0 && ( // Assuming resources have a category
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">Recommended for You</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {service.resources.filter(r => r.category === 'recommended').map(resource => (
                      <div key={resource.id} className="resource-card" tabIndex="0" role="button" aria-label={`Learn about ${resource.title}`} data-resource-id={resource.id}> {/* Assuming resource has id and title */}
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm mb-1 text-gray-900">{resource.title}</h5>
                              <p className="text-xs text-gray-600 mb-2">{resource.description}</p> {/* Assuming resource has description */}
                              <div className="flex items-center text-xs">
                                {resource.status === 'new' && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium mr-2">New</span>} {/* Assuming resource has status */}
                                {resource.status === 'in-progress' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium mr-2">In Progress</span>}
                                {resource.status === 'completed' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mr-2">✓ Completed</span>}
                                <span className={resource.status === 'completed' ? 'text-gray-500' : 'text-blue-600'}>{resource.readTime} min read</span> {/* Assuming resource has readTime */}
                                {resource.status === 'in-progress' && <span className="text-gray-600 ml-2">• {resource.progress}% complete</span>} {/* Assuming resource has progress */}
                              </div>
                            </div>
                            {resource.imageUrl && <img className="w-10 h-10 rounded-md object-cover ml-3" src={resource.imageUrl} alt={resource.title} />} {/* Assuming resource has imageUrl */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Week Focus - needs to use fetched data */}
              {service.resources?.filter(r => r.category === 'week-focus').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">{service.weekFocusTitle || 'Weekly Focus'}</h4> {/* Assuming service has weekFocusTitle */}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {service.resources.filter(r => r.category === 'week-focus').map(resource => (
                       <div key={resource.id} className="resource-card" tabIndex="0" role="button" aria-label={`Learn about ${resource.title}`} data-resource-id={resource.id}>
                         <div className="p-3">
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <h5 className="font-semibold text-sm mb-1 text-gray-900">{resource.title}</h5>
                               <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                               <div className="flex items-center text-xs">
                                 {resource.status === 'new' && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium mr-2">New</span>}
                                 {resource.status === 'in-progress' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium mr-2">In Progress</span>}
                                 {resource.status === 'completed' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mr-2">✓ Completed</span>}
                                 <span className={resource.status === 'completed' ? 'text-gray-500' : 'text-blue-600'}>{resource.readTime} min read</span>
                                 {resource.status === 'in-progress' && <span className="text-gray-600 ml-2">• {resource.progress}% complete</span>}
                               </div>
                             </div>
                             {resource.imageUrl && <img className="w-10 h-10 rounded-md object-cover ml-3" src={resource.imageUrl} alt={resource.title} />}
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Quick Help - needs to use fetched data */}
              {service.resources?.filter(r => r.category === 'quick-help').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">Quick Help</h4>
                  </div>
                  <div className="space-y-2">
                    {service.resources.filter(r => r.category === 'quick-help').map(resource => (
                      <button key={resource.id} className="quick-help-button" data-instruction-type={resource.instructionType}> {/* Assuming quick help resources have instructionType */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{resource.title}</h5>
                            <p className="text-xs text-gray-600">{resource.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-purple-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* Coming Up - needs to use fetched data */}
              {service.resources?.filter(r => r.category === 'coming-up').length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700">{service.comingUpTitle || 'Coming Up'}</h4> {/* Assuming service has comingUpTitle */}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {service.resources.filter(r => r.category === 'coming-up').map(resource => (
                      <div key={resource.id} className={`resource-card ${resource.isLocked ? 'opacity-75' : ''}`} tabIndex="0" role="button" aria-label={`${resource.title} ${resource.unlockText || ''}`} data-resource-id={resource.id}> {/* Assuming resource has isLocked and unlockText */}
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm mb-1 text-gray-900">{resource.title}</h5>
                              <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                              <div className="flex items-center text-xs">
                                {resource.unlockText && <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">{resource.unlockText}</span>}
                              </div>
                            </div>
                            {resource.imageUrl && <img className={`w-10 h-10 rounded-md object-cover ml-3 ${resource.isLocked ? 'opacity-50' : ''}`} src={resource.imageUrl} alt={resource.title} />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}


        {/* Trending Medications - needs to use fetched data */}
        {/* This section might be better placed outside the individual service content blocks
            if it's a general trending list, or filtered by active service if relevant */}
        {/* For now, keeping it here but noting it might need refactoring */}
        <div className="program-card mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Trending Medications</h3>
            <p className="text-sm text-gray-500">Popular choices this month</p>
          </div>
          <div className="relative">
            <div className="program-tabs -mx-5 px-5 pb-1">
              {/* This section should ideally render trending products fetched from an API */}
              {/* Using hardcoded examples for now, but they should have data attributes for handlers */}

              <div className="trending-card program-weight" tabIndex="0" role="button" aria-label="Semaglutide - GLP-1 Weekly injections from $89 per month" data-product-id="semaglutide-rx">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">Rx</div>
                  <div className="text-xs text-gray-600 font-medium">$89/mo</div>
                </div>
                <div className="flex justify-center flex-1 items-center mb-3">
                  <div className="trending-card-icon-bg">
                    <svg className="trending-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 0L11.314 12.686M12.686 11.314l3.536-3.536m-3.536 3.536l3.536 3.536M11.314 12.686L7.778 16.222m7.071-10.586a7.5 7.5 0 11-10.586 0 7.5 7.5 0 0110.586 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Semaglutide</h4>
                  <p className="text-xs text-gray-600">GLP-1 Weekly</p>
                </div>
              </div>

              <div className="trending-card program-hair" tabIndex="0" role="button" aria-label="Tirzepatide - Dual Action from $249 per month" data-product-id="tirzepatide-rx">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded font-medium">Rx</div>
                  <div className="text-xs text-gray-600 font-medium">$249/mo</div>
                </div>
                <div className="flex justify-center flex-1 items-center mb-3">
                  <div className="trending-card-icon-bg">
                    <svg className="trending-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Tirzepatide</h4>
                  <p className="text-xs text-gray-600">Dual Action</p>
                </div>
              </div>

              <div className="trending-card program-weight" tabIndex="0" role="button" aria-label="Oral GLP-1 - No Injections from $119 per month" data-product-id="oral-glp1-rx">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">Rx</div>
                  <div className="text-xs text-gray-600 font-medium">$119/mo</div>
                </div>
                <div className="flex justify-center flex-1 items-center mb-3">
                  <div className="trending-card-icon-bg">
                    <svg className="trending-card-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 5a1 1 0 011-1h8a1 1 0 011 1v1H5V5zm0 2h10V6H5v1zm0 2h10V8H5v1zm0 2h10v-1H5v1zm0 2h10v-1H5v1zM5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Oral GLP-1</h4>
                  <p className="text-xs text-gray-600">No Injections</p>
                </div>
              </div>

              <div className="trending-card program-aging" tabIndex="0" role="button" aria-label="GLP-1 plus B12 - Energy Boost from $159 per month" data-product-id="glp1-b12-rx">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium">Rx</div>
                  <div className="text-xs text-gray-600 font-medium">$159/mo</div>
                </div>
                <div className="flex justify-center flex-1 items-center mb-3">
                  <div className="trending-card-icon-bg">
                    <svg className="trending-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">GLP-1 + B12</h4>
                  <p className="text-xs text-gray-600">Energy Boost</p>
                </div>
              </div>

              <div className="trending-card program-hair" tabIndex="0" role="button" aria-label="Minoxidil - Hair Growth from $39 per month" data-product-id="minoxidil-rx">
                 <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded font-medium">Rx</div>
                  <div className="text-xs text-gray-600 font-medium">$39/mo</div>
                </div>
                <div className="flex justify-center flex-1 items-center mb-3">
                  <div className="trending-card-icon-bg">
                    <svg className="trending-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4l4-4m6 1h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Minoxidil</h4>
                  <p className="text-xs text-gray-600">Hair Growth</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Referral Program Section - uses hardcoded data, should be fetched */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Give $40, Get $40</h3>
                <p className="text-indigo-100 text-sm">Share Zappy with friends and both get rewarded</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121L15.5 15.5l-2.5-2.5c-.779-.779-2.049-.779-2.828 0L8.5 14.5l-1.304-1.379A3 3 0 002 15v2h5.5"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>

            {/* Progress indicator - uses hardcoded data */}
            <div className="bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Your progress</span>
                <span className="text-sm font-bold">2/3 friends</span>
              </div>
              <div className="bg-white/20 rounded-full h-2 mb-3">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '66.7%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-xs font-bold">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-xs font-bold">
                    SM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white border-dashed flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-100">1 more friend</p>
                  <p className="text-xs font-bold text-yellow-400">= $80 total</p>
                </div>
              </div>
            </div>

            {/* Share options */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex items-center justify-center space-x-2"
                      data-share-method="copy">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium">Copy Link</span>
              </button>

              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex items-center justify-center space-x-2"
                      data-share-method="share">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z"></path>
                </svg>
                <span className="text-sm font-medium">Share Now</span>
              </button>
            </div>

            {/* Referral code */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs text-indigo-100 mb-2">Your referral code</p>
              <div className="bg-white/20 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="font-mono font-bold text-lg tracking-wider">MICHEL40</span>
                <button className="text-yellow-400 hover:text-yellow-300 transition-colors" data-copy-referral>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Instruction Modal */}
      {showInstructionsModal && currentInstruction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-4">{currentInstruction.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: currentInstruction.content }} className="mb-4 text-gray-700"></div>
            <button
              className="cta-primary w-full"
              onClick={handleCloseInstructionsModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation is handled in MainLayout */}
    </div>
  );
};

export default PatientHomePage;
