import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  HoneycombEvent, SupportNeed, Shift, VolunteerRegistration, DirectDonation, 
  LifecyclePhase, NeedAssignmentStatus, DutyCategory, ComplianceRequirement,
  STANDARD_COMPLIANCE
} from '../types';
import { 
  INITIAL_EVENT, INITIAL_NEEDS, INITIAL_SHIFTS, 
  INITIAL_VOLUNTEERS, INITIAL_DONATIONS 
} from '../data/seedData';
import confetti from 'canvas-confetti';

interface ToastState {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface HoneycombContextType {
  event: HoneycombEvent;
  needs: SupportNeed[];
  shifts: Shift[];
  volunteers: VolunteerRegistration[];
  donations: DirectDonation[];
  
  // Navigation & Persona
  activeRole: 'organizer' | 'volunteer' | 'minh_preview';
  setActiveRole: (role: 'organizer' | 'volunteer' | 'minh_preview') => void;
  currentLifecyclePhase: LifecyclePhase;
  setCurrentLifecyclePhase: (phase: LifecyclePhase) => void;
  
  // Modal controllers
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  isMinhModalOpen: boolean;
  setIsMinhModalOpen: (open: boolean) => void;
  isSpreadsheetModalOpen: boolean;
  setIsSpreadsheetModalOpen: (open: boolean) => void;
  
  // Step 1: Event Registration & Claiming
  registerEvent: (data: {
    name: string;
    organizationName: string;
    location: string;
    date: string;
    startTime: string;
    lengthHours: number;
    registeredByRole: 'organizer' | 'volunteer';
    registeredByName: string;
    registeredByEmail: string;
    organizerName: string;
    organizerEmail: string;
    privacy: 'public' | 'private';
    accessCode?: string;
  }) => { success: boolean; claimToken?: string };
  claimEvent: (token: string) => boolean;
  
  // Step 2: Needs & Shifts Management
  updateEventGoals: (goals: { purpose: string; communityImpact: string; fundraisingTarget: number }) => void;
  addEquipmentNeed: (need: Omit<SupportNeed, 'id' | 'eventId' | 'quantityFulfilled'>) => void;
  assignNeedToPerson: (needId: string, assignee: { name: string; email: string; phone?: string; dueDate?: string; notes?: string }) => string;
  confirmNeedResponse: (token: string, response: 'confirm' | 'decline', notes?: string) => { success: boolean; fallbackApplied?: string };
  sendNeedReminder: (needId: string) => void;
  releaseNeedToPublic: (needId: string) => void;
  
  addShift: (shiftData: Omit<Shift, 'id' | 'eventId' | 'filledCount'>) => void;
  registerVolunteerForShift: (shiftId: string, volunteerData: {
    name: string;
    email: string;
    phone: string;
    isMinor: boolean;
    parentName?: string;
    credentialId?: string;
    documentName?: string;
  }) => { success: boolean; magicToken: string };
  
  // Step 3: Outcomes & Verification
  verifyVolunteerHours: (volunteerId: string, hours: number) => void;
  verifyAllPendingHours: () => void;
  verifyComplianceProof: (volunteerId: string) => void;
  recordDirectDonation: (donation: { donorName: string; donorEmail: string; amount: number }) => void;
  confirmDonation: (donationId: string) => void;
  triggerCelebrationConfetti: () => void;
  
  // Toast notifications
  toast: ToastState | null;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  dismissToast: () => void;
  
  // Reset demo data
  resetToDefaultData: () => void;
}

const HoneycombContext = createContext<HoneycombContextType | undefined>(undefined);

const STORAGE_KEY = 'hive_booster_app_state_v1';

export const HoneycombProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [event, setEvent] = useState<HoneycombEvent>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_event`);
    return saved ? JSON.parse(saved) : INITIAL_EVENT;
  });

  const [needs, setNeeds] = useState<SupportNeed[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_needs`);
    return saved ? JSON.parse(saved) : INITIAL_NEEDS;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shifts`);
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_volunteers`);
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEERS;
  });

  const [donations, setDonations] = useState<DirectDonation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_donations`);
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [activeRole, setActiveRole] = useState<'organizer' | 'volunteer' | 'minh_preview'>('organizer');
  const [currentLifecyclePhase, setCurrentLifecyclePhase] = useState<LifecyclePhase>('setup');
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMinhModalOpen, setIsMinhModalOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Synchronize state to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_event`, JSON.stringify(event));
  }, [event]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_needs`, JSON.stringify(needs));
  }, [needs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shifts`, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_volunteers`, JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_donations`, JSON.stringify(donations));
  }, [donations]);

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(prev => prev && prev.title === title ? null : prev);
    }, 4500);
  };

  const dismissToast = () => setToast(null);

  const triggerCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#fbbf24', '#fde68a', '#10b981', '#6366f1']
      });
    } catch {
      // Fallback safe
    }
  };

  // STEP 1: REGISTER EVENT (Organizer vs Volunteer Nominate)
  const registerEvent = (data: {
    name: string;
    organizationName: string;
    location: string;
    date: string;
    startTime: string;
    lengthHours: number;
    registeredByRole: 'organizer' | 'volunteer';
    registeredByName: string;
    registeredByEmail: string;
    organizerName: string;
    organizerEmail: string;
    privacy: 'public' | 'private';
    accessCode?: string;
  }) => {
    const isOrg = data.registeredByRole === 'organizer';
    const claimToken = isOrg ? undefined : `claim-${Date.now().toString(36)}`;
    
    const newEvent: HoneycombEvent = {
      id: `evt-${Date.now().toString(36)}`,
      name: data.name,
      organizationName: data.organizationName,
      location: data.location,
      date: data.date,
      startTime: data.startTime,
      lengthHours: data.lengthHours,
      privacy: data.privacy,
      accessCode: data.accessCode || (data.privacy === 'private' ? '1234' : undefined),
      status: isOrg ? 'planning' : 'draft_unclaimed',
      currentPhase: 'planning',
      registeredByRole: data.registeredByRole,
      registeredByName: data.registeredByName,
      registeredByEmail: data.registeredByEmail,
      organizerName: isOrg ? data.registeredByName : data.organizerName,
      organizerEmail: isOrg ? data.registeredByEmail : data.organizerEmail,
      isClaimed: isOrg,
      claimToken,
      goals: {
        purpose: 'Provide memorable community impact and support for our student athletes & children',
        communityImpact: 'Foster school spirit, family participation, and team readiness',
        fundraisingTarget: 2500,
        fundsRaised: 0
      },
      createdAt: new Date().toISOString()
    };

    setEvent(newEvent);

    if (isOrg) {
      showToast('success', 'Event Created! 🐝', `Welcome ${data.registeredByName}! Moving to Step 2: Planning & Setup.`);
      setCurrentLifecyclePhase('planning');
      setActiveRole('organizer');
    } else {
      showToast(
        'info', 
        'Organizer Claim Email Sent! 📩', 
        `Simulated claim link sent to ${data.organizerEmail}. The organizer can tap to claim and manage the event.`
      );
    }

    triggerCelebrationConfetti();
    return { success: true, claimToken };
  };

  const claimEvent = (token: string): boolean => {
    if (event.claimToken === token || token === 'demo-claim') {
      setEvent(prev => ({
        ...prev,
        isClaimed: true,
        status: 'planning',
        currentPhase: 'planning'
      }));
      showToast('success', 'Event Claimed! 🌟', 'You are now verified as the Event Organizer.');
      triggerCelebrationConfetti();
      return true;
    }
    showToast('error', 'Invalid Link', 'Could not find a pending event with this claim token.');
    return false;
  };

  // STEP 2: NEEDS MANAGEMENT (Minh's Assignment & Reminders)
  const updateEventGoals = (goals: { purpose: string; communityImpact: string; fundraisingTarget: number }) => {
    setEvent(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        ...goals
      }
    }));
    showToast('success', 'Goals Updated', 'Event goals and community impact statement saved.');
  };

  const addEquipmentNeed = (needData: Omit<SupportNeed, 'id' | 'eventId' | 'quantityFulfilled'>) => {
    const newNeed: SupportNeed = {
      ...needData,
      id: `need-${Date.now().toString(36)}`,
      eventId: event.id,
      quantityFulfilled: needData.assignedTo?.status === 'confirmed' ? needData.quantityNeeded : 0
    };
    setNeeds(prev => [newNeed, ...prev]);
    showToast('success', 'Support Need Added', `Added "${needData.title}" to the event support checklist.`);
  };

  const assignNeedToPerson = (needId: string, assignee: { name: string; email: string; phone?: string; dueDate?: string; notes?: string }) => {
    const confirmationToken = `confirm-${Date.now().toString(36)}`;
    
    setNeeds(prev => prev.map(need => {
      if (need.id !== needId) return need;
      return {
        ...need,
        assignedTo: {
          name: assignee.name,
          email: assignee.email,
          phone: assignee.phone,
          assignedAt: new Date().toISOString(),
          status: 'pending',
          confirmationToken,
          notes: assignee.notes
        }
      };
    }));

    showToast(
      'info',
      `Assigned to ${assignee.name}! 📨`,
      `Sent email alert to ${assignee.email} with 1-click confirmation buttons.`
    );

    return confirmationToken;
  };

  // MINH ASSIGNMENT RESPONSE (Confirm or Decline + Fallback)
  const confirmNeedResponse = (token: string, response: 'confirm' | 'decline', notes?: string) => {
    let fallbackApplied: string | undefined;
    let targetNeed: SupportNeed | undefined;

    setNeeds(prev => prev.map(need => {
      if (need.assignedTo?.confirmationToken !== token) return need;
      targetNeed = need;
      const isConfirmed = response === 'confirm';
      
      let updatedAssignment = {
        ...need.assignedTo,
        status: (isConfirmed ? 'confirmed' : 'declined') as NeedAssignmentStatus,
        confirmedAt: isConfirmed ? new Date().toISOString() : undefined,
        declinedAt: !isConfirmed ? new Date().toISOString() : undefined,
        notes: notes || need.assignedTo.notes
      };

      let newQuantityFulfilled = isConfirmed ? need.quantityNeeded : 0;

      // Handle Fallback on Decline
      if (!isConfirmed) {
        if (need.fallbackOption === 'auto_public_wishlist' || need.fallbackOption === 'both') {
          fallbackApplied = 'auto_public_wishlist';
          // Release to public wishlist
          return {
            ...need,
            quantityFulfilled: 0,
            assignedTo: undefined // Opens to everyone
          };
        }
      }

      return {
        ...need,
        quantityFulfilled: newQuantityFulfilled,
        assignedTo: updatedAssignment
      };
    }));

    if (response === 'confirm') {
      showToast('success', 'Delivery Confirmed! 🥳', `Thank you! Your pledge to bring ${targetNeed?.title || 'the item'} has been recorded.`);
      triggerCelebrationConfetti();
    } else {
      if (fallbackApplied === 'auto_public_wishlist') {
        showToast('warning', 'Need Re-Opened to Public', `Item was released to the community wishlist so another parent can step in.`);
      } else {
        showToast('info', 'Adjustment Recorded', `Organizer alerted that this item was declined and needs reassignment.`);
      }
    }

    return { success: true, fallbackApplied };
  };

  const sendNeedReminder = (needId: string) => {
    let assigneeName = 'Supporter';
    setNeeds(prev => prev.map(need => {
      if (need.id !== needId || !need.assignedTo) return need;
      assigneeName = need.assignedTo.name;
      return {
        ...need,
        assignedTo: {
          ...need.assignedTo,
          reminderSentAt: new Date().toISOString()
        }
      };
    }));

    showToast('success', 'Reminder Dispatched! ⏰', `Sent reminder message to ${assigneeName} with quick confirmation pass.`);
  };

  const releaseNeedToPublic = (needId: string) => {
    setNeeds(prev => prev.map(need => {
      if (need.id !== needId) return need;
      return {
        ...need,
        assignedTo: undefined,
        quantityFulfilled: 0
      };
    }));
    showToast('info', 'Released to Wishlist', 'Item is now open for any parent or volunteer to claim.');
  };

  // SHIFTS & VOLUNTEER REGISTRATION
  const addShift = (shiftData: Omit<Shift, 'id' | 'eventId' | 'filledCount'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: `shift-${Date.now().toString(36)}`,
      eventId: event.id,
      filledCount: 0
    };
    setShifts(prev => [...prev, newShift]);
    showToast('success', 'Shift Created! 📋', `Added "${shiftData.title}" (${shiftData.startTime} - ${shiftData.endTime}).`);
  };

  const registerVolunteerForShift = (shiftId: string, volunteerData: {
    name: string;
    email: string;
    phone: string;
    isMinor: boolean;
    parentName?: string;
    credentialId?: string;
    documentName?: string;
  }) => {
    const targetShift = shifts.find(s => s.id === shiftId);
    if (!targetShift) return { success: false, magicToken: '' };

    const magicToken = `pass-${Date.now().toString(36)}`;
    const hours = calculateHoursBetween(targetShift.startTime, targetShift.endTime);

    const newVol: VolunteerRegistration = {
      id: `vol-${Date.now().toString(36)}`,
      shiftId,
      eventId: event.id,
      name: volunteerData.name,
      email: volunteerData.email,
      phone: volunteerData.phone,
      isMinor: volunteerData.isMinor,
      parentName: volunteerData.parentName,
      magicPassToken: magicToken,
      complianceProof: {
        credentialId: volunteerData.credentialId,
        documentName: volunteerData.documentName,
        isVerified: !targetShift.compliance.requiresUploadOrId, // auto verify if open to all
        verifiedByOrganizer: !targetShift.compliance.requiresUploadOrId
      },
      checkInStatus: 'pending',
      hoursCompleted: hours,
      hoursVerified: false,
      registeredAt: new Date().toISOString()
    };

    setVolunteers(prev => [newVol, ...prev]);

    // Update shift capacity
    setShifts(prev => prev.map(s => {
      if (s.id !== shiftId) return s;
      return { ...s, filledCount: s.filledCount + 1 };
    }));

    showToast('success', 'Spot Claimed! 🎉', `Welcome ${volunteerData.name}! Your 1-tap pass has been saved to your device.`);
    triggerCelebrationConfetti();
    return { success: true, magicToken };
  };

  // STEP 3: OUTCOMES & VERIFICATION
  const verifyVolunteerHours = (volunteerId: string, hours: number) => {
    setVolunteers(prev => prev.map(vol => {
      if (vol.id !== volunteerId) return vol;
      return {
        ...vol,
        hoursCompleted: hours,
        hoursVerified: true,
        checkInStatus: 'checked_in'
      };
    }));
    showToast('success', 'Hours Verified! ✓', `Confirmed ${hours} service hours for volunteer.`);
  };

  const verifyAllPendingHours = () => {
    setVolunteers(prev => prev.map(vol => ({
      ...vol,
      hoursVerified: true,
      checkInStatus: 'checked_in'
    })));
    showToast('success', 'All Hours Verified! 🌟', 'All volunteers marked as verified.');
    triggerCelebrationConfetti();
  };

  const verifyComplianceProof = (volunteerId: string) => {
    setVolunteers(prev => prev.map(vol => {
      if (vol.id !== volunteerId || !vol.complianceProof) return vol;
      return {
        ...vol,
        complianceProof: {
          ...vol.complianceProof,
          isVerified: true,
          verifiedByOrganizer: true,
          verifiedAt: new Date().toISOString()
        }
      };
    }));
    showToast('success', 'Compliance Approved 🛡️', 'Volunteer credential marked as verified.');
  };

  const recordDirectDonation = (donationData: { donorName: string; donorEmail: string; amount: number }) => {
    const newDonation: DirectDonation = {
      id: `don-${Date.now().toString(36)}`,
      eventId: event.id,
      donorName: donationData.donorName,
      donorEmail: donationData.donorEmail,
      amount: donationData.amount,
      date: new Date().toISOString().split('T')[0],
      isConfirmed: true,
      taxReceiptNumber: `TAX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      taxLetterSent: true
    };

    setDonations(prev => [newDonation, ...prev]);
    setEvent(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        fundsRaised: prev.goals.fundsRaised + donationData.amount
      }
    }));

    showToast('success', `Received $${donationData.amount}! 💝`, `IRS 501(c)(3) tax receipt automatically prepared for ${donationData.donorName}.`);
    triggerCelebrationConfetti();
  };

  const confirmDonation = (donationId: string) => {
    setDonations(prev => prev.map(d => {
      if (d.id !== donationId) return d;
      return { ...d, isConfirmed: true, taxLetterSent: true };
    }));
    showToast('success', 'Donation Confirmed', 'Tax acknowledgment letter issued.');
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setEvent(INITIAL_EVENT);
    setNeeds(INITIAL_NEEDS);
    setShifts(INITIAL_SHIFTS);
    setVolunteers(INITIAL_VOLUNTEERS);
    setDonations(INITIAL_DONATIONS);
    setCurrentLifecyclePhase('setup');
    showToast('info', 'Demo Data Reset', 'Restored original Oak Creek Booster Club sample data.');
  };

  return (
    <HoneycombContext.Provider
      value={{
        event,
        needs,
        shifts,
        volunteers,
        donations,
        activeRole,
        setActiveRole,
        currentLifecyclePhase,
        setCurrentLifecyclePhase,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isMinhModalOpen,
        setIsMinhModalOpen,
        isSpreadsheetModalOpen,
        setIsSpreadsheetModalOpen,
        registerEvent,
        claimEvent,
        updateEventGoals,
        addEquipmentNeed,
        assignNeedToPerson,
        confirmNeedResponse,
        sendNeedReminder,
        releaseNeedToPublic,
        addShift,
        registerVolunteerForShift,
        verifyVolunteerHours,
        verifyAllPendingHours,
        verifyComplianceProof,
        recordDirectDonation,
        confirmDonation,
        triggerCelebrationConfetti,
        toast,
        showToast,
        dismissToast,
        resetToDefaultData
      }}
    >
      {children}
    </HoneycombContext.Provider>
  );
};

export const useHoneycomb = () => {
  const context = useContext(HoneycombContext);
  if (!context) {
    throw new Error('useHoneycomb must be used within a HoneycombProvider');
  }
  return context;
};

// Helper
function calculateHoursBetween(start: string, end: string): number {
  try {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(1, Math.round((diff / 60) * 10) / 10);
  } catch {
    return 3.0;
  }
}
