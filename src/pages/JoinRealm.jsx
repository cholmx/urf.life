import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {submitRealmSignup} from '../lib/contactStorage';
import StandardButton from '../components/StandardButton';
import {useToast} from '../hooks/useToast';

const {FiUserPlus,FiCheckCircle,FiUser,FiMail,FiPhone,FiMapPin,FiCalendar,FiHeart,FiHome,FiArrowRight}=FiIcons;

const JoinRealm=()=> {
  const toast=useToast();
  const [formData,setFormData]=useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    birthday: '',
    maritalStatus: '',
    anniversary: ''
  });
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [isSubmitted,setIsSubmitted]=useState(false);

  const maritalStatusOptions=[
    {value: '',label: 'Select...'},
    {value: 'married',label: 'Married'},
    {value: 'separated',label: 'Separated'},
    {value: 'unmarried',label: 'Unmarried'},
    {value: 'widowed',label: 'Widowed'}
  ];

  const handleInputChange=(e)=> {
    const {name,value}=e.target;
    setFormData((prev)=> ({...prev,[name]: value}));
  };

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {error}=await submitRealmSignup({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        birthday: formData.birthday || null,
        marital_status: formData.maritalStatus,
        anniversary: formData.anniversary || null
      });
      if (error) throw error;
      setIsSubmitted(true);
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
              <h2 className="text-3xl font-bold text-text-primary mb-3">
                Welcome to Realm!
              </h2>
              <p className="text-text-primary mb-8 leading-relaxed">
                Your registration has been submitted. We'll process your information and send you access details soon.
              </p>
              <div className="space-y-3">
                <button
                  onClick={()=> setIsSubmitted(false)}
                  className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiUserPlus} className="h-4 w-4" />
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
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.8}}
                className="flex items-center justify-center space-x-4 mb-1"
              >
                <SafeIcon icon={FiUserPlus} className="h-8 w-8 text-primary" />
                <h1 className="text-3xl md:text-4xl">Join Realm</h1>
              </motion.div>
              <motion.p
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.8,delay: 0.2}}
                className="text-base page-subtitle"
              >
                Connect with our church community through Realm
              </motion.p>
            </div>

            <motion.div
              initial={{opacity: 0,y: 30}}
              animate={{opacity: 1,y: 0}}
              transition={{duration: 0.8,delay: 0.4}}
              className="bg-white rounded-3xl shadow-modern p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="form-section">
                  <p className="form-section-title">Personal Information</p>
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
                      <label className="form-label">Phone Number *</label>
                      <div className="relative">
                        <SafeIcon icon={FiPhone} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="form-input pl-9"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="form-section">
                  <p className="form-section-title">Home Address</p>
                  <div className="relative">
                    <SafeIcon icon={FiMapPin} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      required
                      className="form-input pl-9"
                      placeholder="Street address"
                    />
                  </div>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Apt, suite, unit (optional)"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Zip"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Country"
                  />
                </div>

                {/* Life Details */}
                <div className="form-section">
                  <p className="form-section-title">Life Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Birthday</label>
                      <div className="relative">
                        <SafeIcon icon={FiCalendar} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="date"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="form-input pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        {maritalStatusOptions.map((option)=> (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.maritalStatus==='married' && (
                    <motion.div
                      initial={{opacity: 0,height: 0}}
                      animate={{opacity: 1,height: 'auto'}}
                      exit={{opacity: 0,height: 0}}
                    >
                      <label className="form-label">Anniversary</label>
                      <div className="relative">
                        <SafeIcon icon={FiHeart} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                        <input
                          type="date"
                          name="anniversary"
                          value={formData.anniversary}
                          onChange={handleInputChange}
                          className="form-input pl-9"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Join Realm'}</span>
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

export default JoinRealm;
