import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {submitTableGroupSignup} from '../lib/contactStorage';
import {useToast} from '../hooks/useToast';

const {FiUsers,FiCheckCircle,FiUser,FiMail,FiHash,FiHome,FiArrowRight,FiCalendar}=FiIcons;

const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const TableGroupSignup=()=> {
  const toast=useToast();
  const [formData,setFormData]=useState({
    firstName: '',
    lastName: '',
    email: '',
    partySize: '',
    unavailableDays: []
  });
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [isSubmitted,setIsSubmitted]=useState(false);

  const handleInputChange=(e)=> {
    const {name,value}=e.target;
    setFormData(prev=> ({...prev,[name]: value}));
  };

  const handleDayToggle=(day)=> {
    setFormData(prev=> ({
      ...prev,
      unavailableDays: prev.unavailableDays.includes(day)
        ? prev.unavailableDays.filter(d=> d !==day)
        : [...prev.unavailableDays,day]
    }));
  };

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {error}=await submitTableGroupSignup({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        party_size: parseInt(formData.partySize),
        unavailable_days: formData.unavailableDays
      });
      if (error) throw error;
      setIsSubmitted(true);
      setFormData({firstName: '',lastName: '',email: '',partySize: '',unavailableDays: []});
    } catch (error) {
      console.error('Error submitting form:',error);
      toast.error('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{opacity: 0,scale: 0.92,y: 20}}
            animate={{opacity: 1,scale: 1,y: 0}}
            exit={{opacity: 0,scale: 0.92}}
            transition={{duration: 0.45}}
            className="flex items-center justify-center min-h-[80vh] px-4"
          >
            <div className="bg-white rounded-3xl shadow-modern-lg p-10 max-w-md w-full text-center">
              <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                transition={{delay: 0.15,type: 'spring',stiffness: 200}}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{backgroundColor: '#83A682'}}
              >
                <SafeIcon icon={FiCheckCircle} className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-text-primary mb-3">You're signed up!</h2>
              <p className="text-text-primary mb-8 leading-relaxed">
                Your Table Group sign-up has been submitted. We'll be in touch soon to help you find the perfect group!
              </p>
              <div className="space-y-3">
                <button
                  onClick={()=> setIsSubmitted(false)}
                  className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiUsers} className="h-4 w-4" />
                  <span>Submit Another</span>
                </button>
                <Link to="/" className="block w-full py-3 px-6 rounded-xl font-semibold border-2 border-accent-dark text-text-primary hover:bg-accent transition-colors text-center">
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            exit={{opacity: 0,y: -20}}
            transition={{duration: 0.3}}
            className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.8}}
                className="flex items-center justify-center space-x-4 mb-1"
              >
                <SafeIcon icon={FiUsers} className="h-8 w-8 text-primary" />
                <h1 className="text-3xl md:text-4xl">Table Group Sign-Up</h1>
              </motion.div>
              <motion.p
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.8,delay: 0.2}}
                className="text-base page-subtitle"
              >
                Complete this quick form and we'll be in touch soon.
              </motion.p>
            </div>

            <motion.div
              initial={{opacity: 0,y: 30}}
              animate={{opacity: 1,y: 0}}
              transition={{duration: 0.8,delay: 0.4}}
              className="bg-white rounded-3xl shadow-modern p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="form-section">
                  <p className="form-section-title">Your Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name *</label>
                      <div className="relative">
                        <SafeIcon icon={FiUser} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="form-input pl-9"
                          placeholder="First"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Last Name *</label>
                      <div className="relative">
                        <SafeIcon icon={FiUser} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="form-input pl-9"
                          placeholder="Last"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Email *</label>
                      <div className="relative">
                        <SafeIcon icon={FiMail} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="form-input pl-9"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Number in Party *</label>
                      <div className="relative">
                        <SafeIcon icon={FiHash} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="number"
                          name="partySize"
                          value={formData.partySize}
                          onChange={handleInputChange}
                          required
                          min="1"
                          max="20"
                          className="form-input pl-9"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="form-section">
                  <p className="form-section-title">Availability</p>
                  <div>
                    <label className="form-label">Days you are unable to meet</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {days.map(day=> {
                        const selected=formData.unavailableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={()=> handleDayToggle(day)}
                            className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                              selected
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-accent-dark bg-white text-text-primary hover:border-primary/50'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {formData.unavailableDays.length > 0 && (
                      <p className="text-xs text-text-light mt-2">
                        Unavailable: {formData.unavailableDays.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Sign-Up'}</span>
                  {!isSubmitting && <SafeIcon icon={FiArrowRight} className="h-5 w-5" />}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableGroupSignup;
