import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {submitContactForm} from '../lib/contactStorage';
import StandardButton from '../components/StandardButton';
import supabase from '../lib/supabase';
import {useToast} from '../hooks/useToast';

const {FiMail,FiCheck,FiUser,FiMessageSquare,FiPhone,FiHome,FiUsers}=FiIcons;

const Contact=()=> {
  const toast=useToast();
  const [formData,setFormData]=useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [isSubmitted,setIsSubmitted]=useState(false);
  const [staffContacts,setStaffContacts]=useState([]);
  const [loadingStaff,setLoadingStaff]=useState(true);

  useEffect(()=> {
    fetchStaffContacts();
  },[]);

  const fetchStaffContacts=async ()=> {
    try {
      const {data,error}=await supabase
        .from('staff_contacts_portal123')
        .select('*')
        .eq('is_active',true)
        .order('display_order',{ascending: true});
      if (error) throw error;
      setStaffContacts(data || []);
    } catch (error) {
      console.error('Error fetching staff contacts:',error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleInputChange=(e)=> {
    const {name,value}=e.target;
    setFormData((prev)=> ({...prev,[name]: value}));
  };

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {error}=await submitContactForm(formData);
      if (error) throw error;
      setIsSubmitted(true);
      setFormData({name: '',email: '',phone: '',subject: '',message: ''});
    } catch (error) {
      console.error('Error submitting form:',error);
      toast.error('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center relative">
        {/* Back to Home Button - Top Right */}
        <div className="fixed top-6 right-6 z-50">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
            <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
          </Link>
        </div>
        <motion.div
          initial={{opacity: 0,scale: 0.9}}
          animate={{opacity: 1,scale: 1}}
          transition={{duration: 0.5}}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiCheck} className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-4">
            Message Sent!
          </h2>
          <p className="text-text-primary mb-6">
            Thank you for your message. We'll get back to you as soon as
            possible.
          </p>
          <div className="space-y-3">
            <StandardButton
              onClick={()=> setIsSubmitted(false)}
              icon={FiMail}
              fullWidth
            >
              Send Another Message
            </StandardButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiMail} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">
                Contact Us
              </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Get in touch with our church team
          </motion.p>
        </div>

        {/* Staff Contacts Section */}
        {!loadingStaff && staffContacts.length > 0 && (
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.3}}
            className="mb-12"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <SafeIcon icon={FiUsers} className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-text-primary">
                  Our Leadership Team
                </h2>
              </div>
              <p className="text-text-light">
                Reach out directly to a member of our staff
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffContacts.map((staff,index)=> (
                <motion.div
                  key={staff.id}
                  initial={{opacity: 0,y: 20}}
                  animate={{opacity: 1,y: 0}}
                  transition={{duration: 0.5,delay: 0.4 + index * 0.1}}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiUser} className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {staff.name}
                      </h3>
                      <p className="text-sm text-text-light mb-2">
                        {staff.title}
                      </p>
                      <a
                        href={`mailto:${staff.email}`}
                        className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors text-sm"
                      >
                        <SafeIcon icon={FiMail} className="h-4 w-4" />
                        <span className="truncate">{staff.email}</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact Form Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Send Us a Message
          </h2>
          <p className="text-text-light">
            Have a question or need assistance? Fill out the form below
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{opacity: 0,y: 30}}
          animate={{opacity: 1,y: 0}}
          transition={{duration: 0.8,delay: 0.6}}
          className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Name *
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiUser}
                  className="absolute left-3 top-3 h-5 w-5 text-text-light"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiMail}
                  className="absolute left-3 top-3 h-5 w-5 text-text-light"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiPhone}
                  className="absolute left-3 top-3 h-5 w-5 text-text-light"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="prayer">Prayer Request</option>
                <option value="ministry">Ministry Information</option>
                <option value="events">Events & Activities</option>
                <option value="pastoral">Pastoral Care</option>
                <option value="volunteer">Volunteer Opportunities</option>
                <option value="technical">Technical Support</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Message *
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiMessageSquare}
                  className="absolute left-3 top-3 h-5 w-5 text-text-light"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="pl-10 w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            <StandardButton
              type="submit"
              disabled={isSubmitting}
              icon={FiMail}
              fullWidth
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </StandardButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;