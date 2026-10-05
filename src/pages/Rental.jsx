import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {submitFacilityRentalRequest} from '../lib/contactStorage';
import {useToast} from '../hooks/useToast';
import {formatTime} from '../utils/dateFormat';
import {ROOM_OPTIONS,SERVICE_OPTIONS,DEPOSIT_AMOUNT,calculateRentalTotal,roomLabel,serviceLabel} from '../lib/rentalPricing';

const {FiKey,FiHome,FiCheckCircle,FiArrowRight,FiArrowLeft,FiPhone,FiMail,FiClock,FiUser,FiExternalLink,FiDollarSign}=FiIcons;

const REALM_GIVE_URL='https://onrealm.org/urfellowship/-/form/give/now';

const STEPS=[
  {id: 1,label: 'Event Information'},
  {id: 2,label: 'Pricing & Rooms'},
  {id: 3,label: 'Guidelines & Policies'},
  {id: 4,label: 'Agreement & Signature'},
];

const todayStr=()=> new Date().toISOString().split('T')[0];

// 15-minute increments only - a native <input type="time"> still lets you
// scroll/type any minute even with a step attribute, so we use a plain
// select instead to actually limit the choices.
const TIME_OPTIONS=Array.from({length: 24 * 4},(_,i)=> {
  const totalMinutes=i * 15;
  const hour24=Math.floor(totalMinutes / 60);
  const minute=totalMinutes % 60;
  const value=`${String(hour24).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
  const hour12=hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period=hour24 < 12 ? 'AM' : 'PM';
  const label=`${hour12}:${String(minute).padStart(2,'0')} ${period}`;
  return {value,label};
});

const EMPTY_FORM={
  event_type: '',
  organization_name: '',
  event_name: '',
  purpose: '',
  guest_count: '',
  event_date: '',
  event_start_time: '',
  event_end_time: '',
  setup_schedule: '',
  setup_arrival_time: '',
  setup_departure_time: '',
  is_member: null,
  rooms: {},
  additional_services: [],
  responsible_first_name: '',
  responsible_last_name: '',
  responsible_email: '',
  responsible_phone: '',
  return_address: '',
  signature_name: '',
  agreed_to_terms: false,
};

const Rental=()=> {
  const toast=useToast();
  const [step,setStep]=useState(1);
  const [formData,setFormData]=useState(EMPTY_FORM);
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [isSubmitted,setIsSubmitted]=useState(false);

  const set=(key,value)=> setFormData((prev)=> ({...prev,[key]: value}));
  const handleChange=(e)=> set(e.target.name,e.target.value);

  const setRoom=(roomId,duration)=> {
    setFormData((prev)=> {
      const rooms={...prev.rooms};
      if (rooms[roomId]===duration) delete rooms[roomId]; // click again to deselect
      else rooms[roomId]=duration;
      // Services are only offered with the Sanctuary - dropping it should
      // drop whatever services were riding on it too, not leave them
      // silently selected with no room to attach to.
      const additionalServices=rooms.sanctuary ? prev.additional_services : [];
      return {...prev,rooms,additional_services: additionalServices};
    });
  };

  const toggleService=(serviceId)=> {
    setFormData((prev)=> ({
      ...prev,
      additional_services: prev.additional_services.includes(serviceId)
        ? prev.additional_services.filter((s)=> s !==serviceId)
        : [...prev.additional_services,serviceId],
    }));
  };

  const pricing=calculateRentalTotal({
    isMember: formData.is_member===true,
    rooms: formData.rooms,
    services: formData.additional_services,
  });
  const hasRoomsSelected=Object.keys(formData.rooms).length > 0;
  const sanctuaryDuration=formData.rooms.sanctuary;

  const validateStep=(current)=> {
    if (current===1) {
      if (!formData.event_type) return 'Select an event type.';
      if (!formData.event_name.trim()) return 'Event name is required.';
      if (!formData.purpose.trim()) return 'Tell us the purpose of your event.';
      if (!formData.guest_count) return 'Estimated number of guests is required.';
      if (!formData.event_date) return 'Event date is required.';
      if (formData.event_date < todayStr()) return 'Event date cannot be in the past.';
      if (!formData.event_start_time || !formData.event_end_time) return 'Event start and end time are required.';
      if (!formData.setup_schedule) return 'Select your setup schedule.';
      if (!formData.setup_arrival_time || !formData.setup_departure_time) return 'Setup arrival and departure time are required.';
      return null;
    }
    if (current===2) {
      if (formData.is_member===null) return 'Let us know if you\'re a member.';
      if (!hasRoomsSelected) return 'Select at least one room.';
      return null;
    }
    if (current===4) {
      if (!formData.responsible_first_name.trim() || !formData.responsible_last_name.trim()) return 'Full name is required.';
      if (!formData.responsible_email.trim()) return 'Email is required.';
      if (!formData.responsible_phone.trim()) return 'Phone number is required.';
      if (!formData.return_address.trim()) return 'Return address for your deposit check is required.';
      if (!formData.signature_name.trim()) return 'Type your name to sign.';
      if (!formData.agreed_to_terms) return 'You must agree to the terms to submit.';
      return null;
    }
    return null;
  };

  const goNext=()=> {
    const error=validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    window.scrollTo({top: 0,behavior: 'smooth'});
    setStep((s)=> Math.min(s + 1,4));
  };
  const goBack=()=> {
    window.scrollTo({top: 0,behavior: 'smooth'});
    setStep((s)=> Math.max(s - 1,1));
  };

  const handleSubmit=async ()=> {
    const error=validateStep(4);
    if (error) {
      toast.error(error);
      return;
    }
    setIsSubmitting(true);
    try {
      const roomsRequested=Object.entries(formData.rooms).map(([roomId,duration])=> roomLabel(roomId,duration));
      const additionalServices=formData.additional_services.map(serviceLabel);

      const {error: submitError}=await submitFacilityRentalRequest({
        event_type: formData.event_type,
        organization_name: formData.organization_name || null,
        event_name: formData.event_name,
        purpose: formData.purpose,
        guest_count: parseInt(formData.guest_count,10),
        event_date: formData.event_date,
        event_start_time: formatTime(formData.event_start_time),
        event_end_time: formatTime(formData.event_end_time),
        setup_schedule: formData.setup_schedule,
        setup_arrival_time: formatTime(formData.setup_arrival_time),
        setup_departure_time: formatTime(formData.setup_departure_time),
        is_member: formData.is_member,
        rooms_requested: roomsRequested,
        additional_services: additionalServices,
        calculated_total: pricing.total,
        responsible_first_name: formData.responsible_first_name,
        responsible_last_name: formData.responsible_last_name,
        responsible_email: formData.responsible_email,
        responsible_phone: formData.responsible_phone,
        return_address: formData.return_address,
        signature_name: formData.signature_name,
        signature_date: todayStr(),
        agreed_to_terms: formData.agreed_to_terms,
      });
      if (submitError) throw new Error(submitError);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting rental request:',err);
      toast.error('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm=()=> {
    setFormData(EMPTY_FORM);
    setStep(1);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center relative">
        <div className="fixed top-6 right-6 z-50">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#cc4733'}} title="Back to Home">
            <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
          </Link>
        </div>
        <motion.div
          initial={{opacity: 0,scale: 0.92,y: 20}}
          animate={{opacity: 1,scale: 1,y: 0}}
          transition={{duration: 0.45}}
          className="card-clay rounded-3xl shadow-modern-lg p-10 max-w-lg w-full text-center mx-4"
        >
          <motion.div
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{delay: 0.15,type: 'spring',stiffness: 200}}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{backgroundColor: '#83A682'}}
          >
            <SafeIcon icon={FiCheckCircle} className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-text-primary mb-3">Request Submitted!</h2>
          <p className="text-text-primary mb-2 leading-relaxed">
            Thanks for requesting to use our facility. We've sent a copy of your request and our rental
            agreement to <strong>{formData.responsible_email || 'your email'}</strong>.
          </p>
          <p className="text-text-primary mb-8 leading-relaxed">
            Church leadership will respond within 3 business days. Once approved, secure your date with a
            $50 refundable deposit check.
          </p>
          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiKey} className="h-4 w-4" />
              <span>Submit Another Request</span>
            </button>
            <Link to="/" className="block w-full py-3 px-6 rounded-xl font-semibold border-2 border-accent-dark text-text-primary hover:bg-accent transition-colors text-center">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#cc4733'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiKey} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl">Facilities Use Request</h1>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Request to rent a space at Upper Room Fellowship
          </motion.p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-1">
          {STEPS.map((s,i)=> (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step===s.id ? 'bg-primary text-white' : step > s.id ? 'bg-primary/20 text-primary' : 'bg-white text-text-light border-2 border-accent-dark'
                  }`}
                >
                  {step > s.id ? <SafeIcon icon={FiCheckCircle} className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-[10px] sm:text-xs text-center font-medium ${step===s.id ? 'text-primary' : 'text-text-light'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mb-5 ${step > s.id ? 'bg-primary/40' : 'bg-accent-dark'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            exit={{opacity: 0,y: -20}}
            transition={{duration: 0.25}}
            className="card-clay rounded-3xl shadow-modern p-6 sm:p-8"
          >
            {step===1 && (
              <div className="space-y-6">
                <div className="form-section">
                  <p className="form-section-title">Contact Information</p>
                  <div className="text-sm text-text-primary space-y-1">
                    <p className="flex items-center gap-2"><SafeIcon icon={FiPhone} className="h-3.5 w-3.5 text-text-light" /> Church Office: (330) 482-9058, option #1 - Greg Aker</p>
                    <p className="flex items-center gap-2"><SafeIcon icon={FiMail} className="h-3.5 w-3.5 text-text-light" /> <a href="mailto:info@urfellowship.com" className="text-primary hover:underline">info@urfellowship.com</a></p>
                    <p className="flex items-center gap-2"><SafeIcon icon={FiClock} className="h-3.5 w-3.5 text-text-light" /> Office Hours: Tuesday-Thursday, 9:00 AM - 12 PM</p>
                  </div>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Reservation Process</p>
                  <ol className="text-sm text-text-primary space-y-1.5 list-decimal list-inside">
                    <li><strong>Date Availability:</strong> Submit this form at least two weeks before your event to verify your date is available.</li>
                    <li><strong>Approval:</strong> Church leadership will respond within 3 business days.</li>
                    <li><strong>Secure Date:</strong> Submit your $50 refundable deposit via separate check to secure your reservation.</li>
                    <li><strong>Final Payment:</strong> All fees due one week before event (separate check from deposit).</li>
                    <li><strong>Cancellation Policy:</strong> Cancellations less than 7 days before event may forfeit deposit.</li>
                  </ol>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Event Details</p>
                  <div>
                    <label className="form-label">Event Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{value: 'personal',label: 'Personal Event'},{value: 'community',label: 'Community Event'}].map((opt)=> (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={()=> set('event_type',opt.value)}
                          className={`py-3 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                            formData.event_type===opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-accent-dark bg-white text-text-primary hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Organization Name <span className="font-normal text-text-light">(if applicable)</span></label>
                    <input type="text" name="organization_name" value={formData.organization_name} onChange={handleChange} className="form-input" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="form-label">Event Name *</label>
                    <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} required className="form-input" placeholder="e.g. Baby shower" />
                  </div>
                  <div>
                    <label className="form-label">Purpose of Your Event *</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleChange} required rows={3} className="form-input resize-none" placeholder="Briefly describe your event" />
                  </div>
                  <div>
                    <label className="form-label">Estimated Number of Guests Attending *</label>
                    <input type="number" name="guest_count" value={formData.guest_count} onChange={handleChange} required min="1" className="form-input" placeholder="50" />
                  </div>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Date &amp; Time</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Event Date *</label>
                      <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required min={todayStr()} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Event Beginning Time *</label>
                      <select name="event_start_time" value={formData.event_start_time} onChange={handleChange} required className="form-input">
                        <option value="" disabled>Select a time</option>
                        {TIME_OPTIONS.map((t)=> <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Event Ending Time *</label>
                      <select name="event_end_time" value={formData.event_end_time} onChange={handleChange} required className="form-input">
                        <option value="" disabled>Select a time</option>
                        {TIME_OPTIONS.map((t)=> <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Event Setup Schedule *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[{value: 'day_of',label: 'Setup on day of event'},{value: 'day_before',label: 'Setup needed day before event'}].map((opt)=> (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={()=> set('setup_schedule',opt.value)}
                          className={`py-3 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                            formData.setup_schedule===opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-accent-dark bg-white text-text-primary hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Setup Arrival Time *</label>
                      <select name="setup_arrival_time" value={formData.setup_arrival_time} onChange={handleChange} required className="form-input">
                        <option value="" disabled>Select a time</option>
                        {TIME_OPTIONS.map((t)=> <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Setup Departure Time *</label>
                      <select name="setup_departure_time" value={formData.setup_departure_time} onChange={handleChange} required className="form-input">
                        <option value="" disabled>Select a time</option>
                        {TIME_OPTIONS.map((t)=> <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step===2 && (
              <div className="space-y-6">
                <div className="form-section">
                  <p className="form-section-title">Facility Rental Fees</p>
                  <ul className="text-sm text-text-primary space-y-1.5 list-disc list-inside">
                    <li><strong>Standard Base Fee:</strong> $50 for non-members, $25 for members (includes Rental Coordinator services and restroom access).</li>
                    <li><strong>Room Rental Fees:</strong> See options below.</li>
                    <li><strong>Member Discount:</strong> Members receive a reduced base fee, 70% off all room rental fees, and standard rates on additional services.</li>
                  </ul>
                  <p className="text-xs text-text-light mt-3">
                    Half Day Rental includes up to 4 hours of event time plus 2 hours of complimentary setup and
                    2 hours of cleanup (8 hours total access). Full Day Rental includes up to 8 hours of event
                    time plus the same setup/cleanup windows (12 hours total access). The Base Fee is a
                    non-refundable administrative fee applied to all rentals.
                  </p>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Membership</p>
                  <label className="form-label">Are you a member of The Upper Room Fellowship? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{value: true,label: 'Yes'},{value: false,label: 'No'}].map((opt)=> (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={()=> set('is_member',opt.value)}
                        className={`py-3 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                          formData.is_member===opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-accent-dark bg-white text-text-primary hover:border-primary/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Rooms Requested *</p>
                  <p className="text-xs text-text-light -mt-2">Select a duration for each room you need. Click a selected option again to remove it.</p>
                  <div className="space-y-2">
                    {ROOM_OPTIONS.map((room)=> (
                      <div key={room.id} className="flex items-center justify-between gap-3 py-2 border-b border-accent last:border-0">
                        <span className="text-sm font-medium text-text-primary">{room.label}</span>
                        <div className="flex gap-2">
                          {['half','full'].map((duration)=> (
                            <button
                              key={duration}
                              type="button"
                              onClick={()=> setRoom(room.id,duration)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-200 ${
                                formData.rooms[room.id]===duration ? 'border-primary bg-primary/10 text-primary' : 'border-accent-dark bg-white text-text-light hover:border-primary/50'
                              }`}
                            >
                              {duration==='half' ? 'Half Day' : 'Full Day'} ${room[duration].toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {sanctuaryDuration && (
                  <div className="form-section">
                    <p className="form-section-title">Additional {sanctuaryDuration==='full' ? 'Full' : 'Half'} Day Services</p>
                    <p className="text-xs text-text-light -mt-2">
                      Sound Technician and Overhead Projector/AV are only available with a Sanctuary rental; priced by your Sanctuary rental's duration.
                    </p>
                    <div className="space-y-2">
                      {SERVICE_OPTIONS.map((svc)=> {
                        const selected=formData.additional_services.includes(svc.id);
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={()=> toggleService(svc.id)}
                            className={`w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl text-sm border-2 transition-all duration-200 ${
                              selected ? 'border-primary bg-primary/10 text-primary' : 'border-accent-dark bg-white text-text-primary hover:border-primary/50'
                            }`}
                          >
                            <span className="font-medium">{svc.label}</span>
                            <span>${svc[sanctuaryDuration].toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wide font-semibold text-primary mb-2">Estimated Price</p>
                  <div className="text-sm text-text-primary space-y-1">
                    <div className="flex justify-between"><span>Base Fee ({formData.is_member ? 'Member' : 'Non-Member'})</span><span>${pricing.baseFee.toFixed(2)}</span></div>
                    <div className="flex justify-between">
                      <span>Room Fees{formData.is_member ? ' (70% off applied)' : ''}</span>
                      <span>${pricing.roomTotalAfterDiscount.toFixed(2)}</span>
                    </div>
                    {pricing.servicesTotal > 0 && (
                      <div className="flex justify-between"><span>Additional Services</span><span>${pricing.servicesTotal.toFixed(2)}</span></div>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary mt-3 pt-3 border-t border-primary/20">
                    <span>Total</span>
                    <span>${pricing.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-text-light mt-2">
                    Plus a separate ${DEPOSIT_AMOUNT.toFixed(2)} refundable security deposit, paid by check once approved.
                  </p>
                </div>
              </div>
            )}

            {step===3 && (
              <div className="space-y-6">
                <PolicySection title="Rental Coordinator Services">
                  <p>Every community event includes a Rental Coordinator who will:</p>
                  <ul>
                    <li>Serve as your primary contact before and during your event</li>
                    <li>Provide facility orientation</li>
                    <li>Be available by phone during your event</li>
                    <li>Conduct pre/post event inspections</li>
                    <li>Ensure proper security and facility usage</li>
                    <li>Assist with basic building system troubleshooting</li>
                  </ul>
                </PolicySection>
                <PolicySection title="Wi-Fi Access">
                  <ul>
                    <li>Complimentary Wi-Fi access is available to all renters</li>
                    <li>Network name and password will be provided by your Rental Coordinator</li>
                    <li>Please note that bandwidth is limited and intended for basic use only</li>
                  </ul>
                </PolicySection>
                <PolicySection title="Building Use Guidelines">
                  <ul>
                    <li><strong>Prohibited:</strong> Alcohol, smoking indoors, helium balloons indoors, open flames</li>
                    <li><strong>Decorations:</strong> Only Command Strips on walls (must be removed after event)</li>
                    <li><strong>Food &amp; Drink:</strong> Not permitted in sanctuary without approval</li>
                    <li><strong>Furniture:</strong> You are responsible for setup, takedown, and returning to original positions</li>
                    <li><strong>Supplies:</strong> Please bring your own tablecloths, paper goods, and drinks</li>
                    <li><strong>Cleanup:</strong> Sweep/mop floors, remove trash, clean kitchen surfaces, remove decorations</li>
                    <li><strong>Security:</strong> Turn off lights/HVAC, lock doors upon leaving</li>
                  </ul>
                </PolicySection>
                <PolicySection title="Liability & Responsibility">
                  <ul>
                    <li>The person signing this agreement must be present during the entire event</li>
                    <li>Renter is responsible for all guests, activities, and any property damage</li>
                    <li>By signing, you agree to hold Upper Room Fellowship harmless from any claims</li>
                  </ul>
                </PolicySection>
                <PolicySection title="Important Reminders">
                  <ul>
                    <li>Events must end by 10:00 PM unless special permission granted</li>
                    <li>Children must be supervised at all times</li>
                    <li>Capacity limits must be observed for each space</li>
                    <li>Emergency exits must remain clear</li>
                  </ul>
                </PolicySection>
                <PolicySection title="Weather & Emergency Policy">
                  <ul>
                    <li>In case of severe weather or emergency situations that affect the use of the facility, Upper Room Fellowship will make every effort to contact you as soon as possible</li>
                    <li>If the church must cancel your event due to weather or unforeseen circumstances, you will receive a full refund of your deposit and any payments made</li>
                    <li>If you need to cancel due to severe weather conditions, please contact the church office immediately</li>
                    <li>Rescheduling options will be offered based on availability</li>
                  </ul>
                </PolicySection>
              </div>
            )}

            {step===4 && (
              <div className="space-y-6">
                <div className="form-section">
                  <p className="form-section-title">Deposit Information</p>
                  <ul className="text-sm text-text-primary space-y-1.5 list-disc list-inside">
                    <li>A ${DEPOSIT_AMOUNT.toFixed(2)} refundable security deposit is required with your reservation form</li>
                    <li>This deposit is SEPARATE from your rental fee/final payment</li>
                    <li>Submit deposit as a separate check made payable to Upper Room Fellowship, in person during office hours or by mail to:</li>
                  </ul>
                  <p className="text-sm text-text-primary mt-2 pl-4">
                    Upper Room Fellowship<br />500 Sponseller Road<br />Columbiana, Ohio 44408
                  </p>
                  <p className="text-xs text-text-light mt-2 pl-4">Please write your event date and full name in the memo line of your deposit check.</p>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Deposit Return &amp; Final Payment</p>
                  <ul className="text-sm text-text-primary space-y-1.5 list-disc list-inside">
                    <li>Your deposit will be fully refunded within 14 days if the facility is returned to its original condition (furniture replaced, surfaces clean, decorations removed, no damage, trash removed)</li>
                    <li>Any necessary cleaning, repair, or charges for extended use will be deducted from your deposit</li>
                    <li>Your rental fee payment is due one week before your scheduled event - separate from your deposit - payable in person, by mail, or online below</li>
                  </ul>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Responsible Person</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name *</label>
                      <div className="relative">
                        <SafeIcon icon={FiUser} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input type="text" name="responsible_first_name" value={formData.responsible_first_name} onChange={handleChange} required className="form-input pl-9" placeholder="First" />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Last Name *</label>
                      <div className="relative">
                        <SafeIcon icon={FiUser} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input type="text" name="responsible_last_name" value={formData.responsible_last_name} onChange={handleChange} required className="form-input pl-9" placeholder="Last" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Email *</label>
                      <div className="relative">
                        <SafeIcon icon={FiMail} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input type="email" name="responsible_email" value={formData.responsible_email} onChange={handleChange} required className="form-input pl-9" placeholder="your.email@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Phone Number *</label>
                      <div className="relative">
                        <SafeIcon icon={FiPhone} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input type="tel" name="responsible_phone" value={formData.responsible_phone} onChange={handleChange} required className="form-input pl-9" placeholder="(555) 123-4567" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Return Address for Down Payment Check *</label>
                    <textarea name="return_address" value={formData.return_address} onChange={handleChange} required rows={2} className="form-input resize-none" placeholder="Street, City, State, Zip" />
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">Price - Pay by check to URF or online via Realm Giving</span>
                    <span className="text-xl font-bold text-primary">${pricing.total.toFixed(2)}</span>
                  </div>
                  <a
                    href={REALM_GIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <SafeIcon icon={FiDollarSign} className="h-4 w-4" />
                    Pay Here
                    <SafeIcon icon={FiExternalLink} className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Signature</p>
                  <p className="text-xs text-text-light">
                    By typing your name below and checking the box, you confirm that you have read and
                    understand this entire agreement, accept responsibility for your guests and any damage
                    that may occur, acknowledge that failure to properly clean or restore the facility may
                    result in loss of your deposit, and agree to all terms and conditions outlined in this
                    document.
                  </p>
                  <div>
                    <label className="form-label">Type Your Full Name to Sign *</label>
                    <input type="text" name="signature_name" value={formData.signature_name} onChange={handleChange} required className="form-input" placeholder="Your full legal name" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreed_to_terms}
                      onChange={(e)=> set('agreed_to_terms',e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary border-accent-dark rounded"
                    />
                    <span className="text-sm text-text-primary">I have read, understand, and agree to the Guidelines &amp; Policies and this entire agreement. *</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-accent">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold border-2 border-accent-dark text-text-primary hover:bg-accent transition-colors"
                >
                  <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
                  Back
                </button>
              ) : <span />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
                >
                  Next
                  <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  {!isSubmitting && <SafeIcon icon={FiArrowRight} className="h-4 w-4" />}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const PolicySection=({title,children})=> (
  <div className="form-section">
    <p className="form-section-title">{title}</p>
    <div className="text-sm text-text-primary [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1.5 [&_li]:leading-snug">
      {children}
    </div>
  </div>
);

export default Rental;
